"""Wayland screen/input bridge. Session creation always uses the OS permission dialog."""
import argparse
import base64
import hashlib
import hmac
import io
import json
import os
from pathlib import Path
import secrets
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import gi
gi.require_version('Gst', '1.0')
from gi.repository import Gio, GLib, Gst
from PIL import Image

PORTAL = 'org.freedesktop.portal.Desktop'
ROOT = '/org/freedesktop/portal/desktop'
REMOTE = 'org.freedesktop.portal.RemoteDesktop'
CAST = 'org.freedesktop.portal.ScreenCast'
Gst.init(None)


class Desktop:
    def __init__(self, state):
        self.bus = Gio.bus_get_sync(Gio.BusType.SESSION, None)
        self.state = state
        self.lock = threading.Lock()
        self.session = None
        self.pipeline = None
        self.fd = None
        self.frame = None
        self.closed_subscription = None
        self.last_error = None
        self.permissions = None
        self.loop = GLib.MainLoop()
        threading.Thread(target=self.loop.run, daemon=True).start()

    def call(self, interface, method, signature, values):
        return self.bus.call_sync(PORTAL, ROOT, interface, method,
                                  GLib.Variant(signature, values), None,
                                  Gio.DBusCallFlags.NONE, 10000, None)

    def request(self, interface, method, signature, values, options):
        token = 'citta_' + secrets.token_hex(12)
        options['handle_token'] = GLib.Variant('s', token)
        path = ROOT + '/request/' + self.bus.get_unique_name()[1:].replace('.', '_') + '/' + token
        done = threading.Event()
        responses = {}
        def response(connection, sender, object_path, iface, signal, parameters):
            responses[object_path] = parameters.unpack()
            if object_path == path:
                done.set()
        subscription = self.bus.signal_subscribe(PORTAL, 'org.freedesktop.portal.Request',
                                                  'Response', None, None, Gio.DBusSignalFlags.NONE,
                                                  response)
        try:
            reply = self.call(interface, method, signature, tuple(values) + (options,))
            path = reply.unpack()[0]
            if path in responses:
                done.set()
            if not done.wait(120):
                self.bus.call_sync(PORTAL, path, 'org.freedesktop.portal.Request', 'Close',
                                   None, None, Gio.DBusCallFlags.NONE, 2000, None)
                raise ValueError('Desktop permission request timed out.')
            code, data = responses[path]
            if code != 0:
                raise ValueError('Desktop permission was declined or cancelled.')
            return data
        finally:
            self.bus.signal_unsubscribe(subscription)

    def disconnect(self):
        session = self.session
        self.session = None
        self.frame = None
        if self.closed_subscription is not None:
            self.bus.signal_unsubscribe(self.closed_subscription)
            self.closed_subscription = None
        if self.pipeline:
            self.pipeline.set_state(Gst.State.NULL)
            self.pipeline = None
        if self.fd is not None:
            os.close(self.fd)
            self.fd = None
        if session:
            try:
                self.bus.call_sync(PORTAL, session, 'org.freedesktop.portal.Session', 'Close',
                                   None, None, Gio.DBusCallFlags.NONE, 2000, None)
            except GLib.Error:
                pass

    def connect(self):
        self.disconnect()
        self.last_error = None
        self.permissions = None
        try:
            result = self.request(REMOTE, 'CreateSession', '(a{sv})', (),
                                  {'session_handle_token': GLib.Variant('s', 'citta_' + secrets.token_hex(12))})
            self.session = result['session_handle']
            session = self.session
            def closed(*args):
                if self.session == session:
                    self.session = None
                    self.frame = None
                    self.last_error = 'Desktop sharing ended. Reconnect from Mind.'
            self.closed_subscription = self.bus.signal_subscribe(
                PORTAL, 'org.freedesktop.portal.Session', 'Closed', session, None,
                Gio.DBusSignalFlags.NONE, closed)
            self.request(REMOTE, 'SelectDevices', '(oa{sv})', (session,),
                         {'types': GLib.Variant('u', 3)})
            self.request(CAST, 'SelectSources', '(oa{sv})', (session,),
                         {'types': GLib.Variant('u', 1), 'multiple': GLib.Variant('b', False),
                          'cursor_mode': GLib.Variant('u', 2)})
            result = self.request(REMOTE, 'Start', '(osa{sv})', (session, ''), {})
            devices = result.get('devices', 0)
            streams = result.get('streams', [])
            if not isinstance(devices, int) or not isinstance(streams, (list, tuple)):
                raise ValueError('GNOME returned an invalid desktop permission response.')
            self.permissions = {'keyboard': bool(devices & 1), 'pointer': bool(devices & 2),
                                'screenCount': len(streams)}
            missing = []
            if not devices & 1:
                missing.append('keyboard')
            if not devices & 2:
                missing.append('mouse/pointer')
            if missing:
                screen = 'A screen was selected, but ' if streams else 'No screen was selected, and '
                raise ValueError(screen + ' and '.join(missing) +
                                 ' control was not granted. Reconnect and allow remote interaction if GNOME offers it. '
                                 'If no control option appears, report the exact dialog title; root access is not required.')
            if not streams:
                raise ValueError('Keyboard and mouse control were granted, but no screen was selected. '
                                 'Reconnect and select a monitor before confirming GNOME sharing.')
            self.node, props = result['streams'][0]
            self.logical_size = props.get('logical_size', props.get('size'))
            if not self.logical_size or min(self.logical_size) <= 0:
                raise ValueError('The portal did not supply usable screen coordinates.')
            reply, fds = self.bus.call_with_unix_fd_list_sync(
                PORTAL, ROOT, CAST, 'OpenPipeWireRemote', GLib.Variant('(oa{sv})', (session, {})),
                None, Gio.DBusCallFlags.NONE, 10000, None, None)
            self.fd = fds.get(reply.unpack()[0])
            self.pipeline = Gst.parse_launch(
                f'pipewiresrc fd={self.fd} path={int(self.node)} do-timestamp=true ! '
                'videoconvert ! video/x-raw,format=RGB ! jpegenc quality=80 ! '
                'appsink name=screen max-buffers=1 drop=true sync=false')
            self.sink = self.pipeline.get_by_name('screen')
            self.pipeline.set_state(Gst.State.PLAYING)
            return self.capture('Desktop session connected.')
        except Exception as error:
            self.disconnect()
            self.last_error = str(error) if isinstance(error, ValueError) else 'Desktop portal or screen capture failed. Check the local driver log.'
            raise

    def status(self):
        return {'connected': bool(self.session and self.pipeline and self.frame),
                'driver': 'xdg-desktop-portal', 'error': self.last_error,
                'permissions': self.permissions}

    def capture(self, description):
        if not self.session or not self.pipeline:
            raise ValueError('No approved desktop session. Connect from the portal first.')
        sample = self.sink.emit('try-pull-sample', 5 * Gst.SECOND)
        if sample is None:
            raise ValueError('The approved screen stream did not produce a frame.')
        buffer = sample.get_buffer()
        image = Image.open(io.BytesIO(buffer.extract_dup(0, buffer.get_size())))
        image.thumbnail((1280, 900))
        output = io.BytesIO()
        image.convert('RGB').save(output, format='JPEG', quality=85)
        data = output.getvalue()
        if len(data) > 3 * 1024 * 1024:
            raise ValueError('Screen image exceeds its size limit.')
        frame = secrets.token_hex(16)
        path = self.state / (frame + '.jpg')
        path.write_bytes(data)
        path.chmod(0o600)
        self.frame = {'id': frame, 'at': time.monotonic(), 'width': image.width, 'height': image.height}
        # Old image references explicitly expire; operation receipts remain for deduplication.
        for old in sorted(self.state.glob('*.jpg'), key=lambda p: p.stat().st_mtime, reverse=True)[100:]:
            old.unlink(missing_ok=True)
        return {'frameId': frame, 'width': image.width, 'height': image.height,
                'sha256': hashlib.sha256(data).hexdigest(), 'capturedAt': time.time(),
                'imageFile': path.name, 'description': description}

    def key(self, symbol, state):
        self.call(REMOTE, 'NotifyKeyboardKeysym', '(oa{sv}iu)', (self.session, {}, symbol, state))

    def validate(self, command):
        if not isinstance(command, dict):
            raise ValueError('Computer command must be an object.')
        action = command.get('action')
        allowed = {'observe': {'action'}, 'click': {'action', 'x', 'y', 'button'},
                   'type': {'action', 'text'}, 'key': {'action', 'keys'},
                   'scroll': {'action', 'steps'}}
        if action not in allowed or set(command) - allowed[action]:
            raise ValueError('Unsupported computer command or fields.')
        if action == 'click':
            if any(type(command.get(k)) is not int for k in ('x', 'y')) or command.get('button', 'left') not in ('left', 'right', 'middle'):
                raise ValueError('Click needs integer coordinates and a supported button.')
        if action == 'type' and (not isinstance(command.get('text'), str) or not 1 <= len(command['text']) <= 2000 or any(ord(c) < 32 and c not in '\n\t' for c in command['text'])):
            raise ValueError('Type needs 1–2000 printable characters.')
        if action == 'scroll' and (type(command.get('steps')) is not int or not 1 <= abs(command['steps']) <= 10):
            raise ValueError('Scroll needs -10..-1 or 1..10 steps.')
        keys = {'CTRL': 0xffe3, 'SHIFT': 0xffe1, 'ALT': 0xffe9, 'SUPER': 0xffeb,
                'ENTER': 0xff0d, 'TAB': 0xff09, 'ESC': 0xff1b, 'BACKSPACE': 0xff08,
                'DELETE': 0xffff, 'LEFT': 0xff51, 'RIGHT': 0xff53, 'UP': 0xff52,
                'DOWN': 0xff54, 'HOME': 0xff50, 'END': 0xff57, 'PAGEUP': 0xff55,
                'PAGEDOWN': 0xff56, 'SPACE': 0x20, **{f'F{i}': 0xffbd+i for i in range(1, 13)}}
        if action == 'key':
            chord = command.get('keys')
            if not isinstance(chord, list) or not 1 <= len(chord) <= 4:
                raise ValueError('Key command needs one key or a chord of up to four keys.')
            for k in chord:
                if not isinstance(k, str) or (k.upper() not in keys and not (len(k) == 1 and k.isascii() and k.isalnum())):
                    raise ValueError('Unsupported key.')
        return action, keys

    def act(self, operation, command, expected_frame):
        action, keys = self.validate(command)
        receipt = self.state / 'operations' / (operation + '.json')
        if receipt.exists():
            record = json.loads(receipt.read_text())
            if record['commandHash'] != hashlib.sha256(json.dumps(command, sort_keys=True).encode()).hexdigest():
                raise ValueError('Operation ID already belongs to another command.')
            if record['state'] != 'done':
                return {'uncertain': True, 'error': 'An earlier attempt may have executed. Observe before making a new decision.'}
            return record['result']
        if not self.session or not self.pipeline:
            raise ValueError('No approved desktop session.')
        if action != 'observe':
            if not self.frame or expected_frame != self.frame['id'] or time.monotonic() - self.frame['at'] > 30:
                raise ValueError('Screen frame is missing, stale or superseded. Observe again.')
            if action == 'click' and not (0 <= command['x'] < self.frame['width'] and 0 <= command['y'] < self.frame['height']):
                raise ValueError('Click is outside the observed screen.')
        record = {'state': 'started', 'commandHash': hashlib.sha256(json.dumps(command, sort_keys=True).encode()).hexdigest()}
        def save():
            temporary = receipt.with_suffix('.tmp')
            with temporary.open('w') as f:
                json.dump(record, f)
                f.flush()
                os.fsync(f.fileno())
            temporary.chmod(0o600)
            temporary.replace(receipt)
        save()
        try:
            # Discard the previous sample so feedback follows the input event.
            self.sink.emit('try-pull-sample', 0)
            if action == 'click':
                self.call(REMOTE, 'NotifyPointerMotionAbsolute', '(oa{sv}udd)',
                          (self.session, {}, self.node, command['x'] * self.logical_size[0] / self.frame['width'],
                           command['y'] * self.logical_size[1] / self.frame['height']))
                button = {'left': 272, 'right': 273, 'middle': 274}[command.get('button', 'left')]
                self.call(REMOTE, 'NotifyPointerButton', '(oa{sv}iu)', (self.session, {}, button, 1))
                self.call(REMOTE, 'NotifyPointerButton', '(oa{sv}iu)', (self.session, {}, button, 0))
            elif action == 'type':
                for c in command['text']:
                    code = {'\n': 0xff0d, '\t': 0xff09}.get(c, ord(c) if ord(c) <= 255 else 0x01000000 | ord(c))
                    self.key(code, 1)
                    self.key(code, 0)
            elif action == 'key':
                pressed = []
                try:
                    for k in command['keys']:
                        code = keys[k.upper()] if k.upper() in keys else ord(k.lower())
                        self.key(code, 1)
                        pressed.append(code)
                finally:
                    for code in reversed(pressed):
                        self.key(code, 0)
            elif action == 'scroll':
                self.call(REMOTE, 'NotifyPointerAxisDiscrete', '(oa{sv}ui)', (self.session, {}, 0, command['steps']))
            if action != 'observe':
                time.sleep(0.25)
                self.sink.emit('try-pull-sample', 0)
            result = self.capture('Observed screen.' if action == 'observe' else f'{action} input delivered; inspect the new screenshot to determine the application outcome.')
            record.update(state='done', result=result)
            save()
            return result
        except Exception:
            return {'uncertain': True, 'error': 'Desktop operation did not finish with confirmed screen feedback. Observe before deciding again.'}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass  # Never log input text, screen content or authentication material.

    def do_POST(self):
        token = self.headers.get('Authorization', '')
        if not hmac.compare_digest(token, 'Bearer ' + self.server.token):
            self.send_error(403)
            return
        if self.headers.get('Origin'):
            self.send_error(403)
            return
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 16384:
                raise ValueError('Request size is outside the limit.')
            request = json.loads(self.rfile.read(length))
            if not isinstance(request, dict):
                raise ValueError('Expected an object.')
            desktop = self.server.desktop
            if self.path == '/status':
                self.reply(200, desktop.status())
                return
            if self.path == '/disconnect':
                desktop.disconnect()
                self.reply(200, {'connected': False})
                return
            with desktop.lock:
                if self.path == '/status':
                    result = desktop.status()
                elif self.path == '/connect':
                    result = desktop.connect()
                elif self.path == '/disconnect':
                    desktop.disconnect()
                    result = {'connected': False}
                elif self.path == '/action':
                    operation = request.get('operationId', '')
                    if not isinstance(operation, str) or len(operation) != 36 or any(c not in '0123456789abcdef-' for c in operation):
                        raise ValueError('Invalid operation ID.')
                    result = desktop.act(operation, request.get('command'), request.get('expectedFrame'))
                else:
                    self.send_error(404)
                    return
                if result.get('imageFile'):
                    path = desktop.state / result['imageFile']
                    if path.exists():
                        result = {**result, 'image': base64.b64encode(path.read_bytes()).decode('ascii')}
                    else:
                        result = {'uncertain': True, 'error': 'The retained screenshot expired. Request a new observation.'}
            self.reply(200, result)
        except (ValueError, json.JSONDecodeError) as error:
            self.reply(400, {'error': str(error), 'uncertain': False})
        except Exception:
            self.reply(503, {'error': 'Desktop portal or screen capture unavailable. Reconnect and check the OS permission session.', 'uncertain': False})

    def reply(self, status, data):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--state', required=True)
    parser.add_argument('--token-file', required=True)
    parser.add_argument('--port', type=int, default=4180)
    args = parser.parse_args()
    state = Path(args.state).resolve()
    state.mkdir(mode=0o700, parents=True, exist_ok=True)
    (state / 'operations').mkdir(mode=0o700, exist_ok=True)
    token = Path(args.token_file).read_text().strip()
    if len(token) < 32:
        raise SystemExit('Desktop token must contain at least 32 characters.')
    server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    server.token = token
    server.desktop = Desktop(state)
    try:
        server.serve_forever()
    finally:
        server.desktop.disconnect()
