'use strict';

const STYLES = {
  barock: {
    name: 'Höfisches Barock',
    prefix: 'Seid gegrüßt, edler Herr / werte Dame!\n\nEs gereicht Uns zur außerordentlichen Ergötzlichkeit, Euch kundzutun:\n',
    suffix: '\n\nIn tiefster Ergebenheit verbleibend,',
    phrases: [
      [/^hallo$/iu, 'Seyed gegrüßet'],
      [/^hi$/iu, 'Seyed gegrüßet'],
      [/^guten tag$/iu, 'Seyed gegrüßet'],
      [/^wie geht es dir\??$/iu, 'wie stehet es um Euer wohlgeschätztes Befinden?'],
      [/^wie gehts dir\??$/iu, 'wie stehet es um Euer wohlgeschätztes Befinden?'],
      [/^ich habe eine frage\.?$/iu, 'ein dringlich Begehren drängt an Unser Ohr'],
      [/^danke\.?$/iu, 'Wir erweisen Euch Unseren verbindlichsten Dank'],
      [/^ja\.?$/iu, 'Wohlan, so sei es'],
      [/^nein\.?$/iu, 'Behüte uns Gott vor solchem Tuen'],
      [/^tschüss\.?$/iu, 'Gott befehle Euch in seine gnädige Obhut'],
      [/^ciao\.?$/iu, 'Gott befehle Euch in seine gnädige Obhut'],
      [/^auf wiedersehen\.?$/iu, 'Gott befehle Euch in seine gnädige Obhut']
    ],
    words: new Map([
      ['geld', 'Güter und Dukaten'], ['arbeiten', 'dem schaffenden Tagewerk nachgehen'], ['arbeite', 'dem schaffenden Tagewerk nachgehen'],
      ['heute', 'am heutigen Tage'], ['schnell', 'ohne Verzug und mit größter Eile'], ['problem', 'Mißhelligkeit']
    ])
  },
  kanzlei: {
    name: 'Kaiserlicher Kanzleistil',
    prefix: 'Kund und zu wissen sei hiermit jedermann:\n\nIn Sachen der nachfolgenden Angelegenheit wird ordnungsgemäß vermerkt:\n',
    suffix: '\n\nSignatum und siegelbewährt unter kaiserlicher Verordnung.',
    phrases: [
      [/^hallo$/iu, 'Zu wissen sei'], [/^guten tag$/iu, 'Zu wissen sei'],
      [/^ich habe eine frage\.?$/iu, 'hiermit wird eine Anfrage vorgetragen'],
      [/^danke\.?$/iu, 'in getreuer Anerkenntnis'],
      [/^nein\.?$/iu, 'dies wird hiermit verneint']
    ],
    words: new Map([
      ['frage', 'Anfrage'], ['geld', 'Münzbestand'], ['schnell', 'unverzüglich'], ['problem', 'unvorhergesehene Hemmnis']
    ])
  },
  poetisch: {
    name: 'Romantisch-Poetisch',
    prefix: 'Wie ein Hauch von Gold verströmt diese Kunde:\n\n',
    suffix: '\n\nSo verweht der Ruf durch den Garten der Zeit.',
    phrases: [
      [/^hallo$/iu, 'Sei uns willkommen wie der Lenz'],
      [/^danke\.?$/iu, 'Mein Herz neigt sich in Dankbarkeit']
    ],
    words: new Map([
      ['nacht', 'samtene Schattenstunde'], ['sonne', 'das goldene Tagesgestirn']
    ])
  }
};

module.exports = { STYLES };
