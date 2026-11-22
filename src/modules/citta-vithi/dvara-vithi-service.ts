import { doors, type Door } from '../dvara/dvara-service.ts';

const senseFunctions = {
  eye: 'dassana',
  ear: 'savana',
  nose: 'ghayana',
  tongue: 'sayana',
  body: 'phusana',
};

export function dvaraVithi(doorName: string, grade: string) {
  const door = doors.find((candidate: Door) => candidate === doorName);
  if (!door) throw new Error('Unknown door: ' + doorName);
  const grades =
    door === 'mind' ? ['clear', 'obscure'] : ['very-great', 'great', 'slight', 'very-slight'];
  if (!grades.includes(grade))
    throw new Error('Choose a grade for ' + door + ': ' + grades.join(', '));

  const moments: { position: number; door: Door; grade: string; phase: string; kicca: string }[] =
    [];
  function add(phase: string, kicca: string, count = 1) {
    for (let i = 0; i < count; i++) {
      moments.push({ position: moments.length + 1, door: doorName as Door, grade, phase, kicca });
    }
  }
  if (grade === 'very-slight') {
    add('Vibration', 'bhavanga', 2);
    return moments;
  }
  add('Vibration', 'bhavanga');
  add('Arrest', 'bhavanga');
  if (door === 'mind') {
    add('Mind-door adverting', 'avajjana');
  } else {
    add('Five-door adverting', 'avajjana');
    add(door + '-consciousness', senseFunctions[door]);
    add('Receiving', 'sampaticchana');
    add('Investigating', 'santirana');
    add('Determining', 'votthapana', grade === 'slight' ? 2 : 1);
  }
  if (grade !== 'slight') add('Javana', 'javana', 7);
  if (grade === 'very-great' || grade === 'clear') add('Registration', 'tadarammana', 2);
  return moments;
}
