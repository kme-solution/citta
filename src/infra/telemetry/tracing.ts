import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  SimpleSpanProcessor,
  type SpanExporter,
  type ReadableSpan,
} from '@opentelemetry/sdk-trace-base';
// Local structured span output deliberately excludes prompts, profile attributes, file contents and arguments.
const exporter: SpanExporter = {
  export(spans: ReadableSpan[], done) {
    for (const span of spans)
      console.info(
        JSON.stringify({
          service: 'citta',
          kind: 'span',
          name: span.name,
          traceId: span.spanContext().traceId,
          spanId: span.spanContext().spanId,
          status: span.status.code,
          durationMs: span.duration[0] * 1000 + span.duration[1] / 1000000,
          actionId: span.attributes['action.id'],
        }),
      );
    done({ code: 0 });
  },
  shutdown: async () => {},
};
export const tracing = new NodeTracerProvider({
  spanProcessors: [new SimpleSpanProcessor(exporter)],
});
tracing.register();
