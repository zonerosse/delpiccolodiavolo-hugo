/**
 * PRENOTAZIONI — Del Piccolo Diavolo
 *
 * Riceve i dati dal modulo /prenota/, li scrive in un foglio di calcolo
 * e invia una notifica email.
 *
 * COSA CAMBIA RISPETTO ALLA VERSIONE PRECEDENTE
 * ---------------------------------------------
 * - nuova colonna "Paese e citta'"
 * - via le colonne "Cosa cerca" e "Tempi", che erano da lista d'attesa
 * - la colonna "Preferenza" ora si chiama "Il cucciolo"
 * - il foglio si chiama "Prenotazioni cuccioli"
 *
 * Se avevi gia' il foglio della lista d'attesa, questo script NON lo tocca:
 * ne crea uno nuovo, cosi' le vecchie righe restano dove sono. Il link del
 * foglio nuovo ti arriva per email appena lanci "creaFoglioAdesso".
 *
 * INSTALLAZIONE
 * -------------
 * 1. Editor Apps Script: cancella tutto (Ctrl+A, Canc) e incolla questo file.
 * 2. Controlla la riga EMAIL_NOTIFICA qui sotto.
 * 3. Salva con Ctrl+S.
 * 4. Menu Esegui -> funzione "creaFoglioAdesso" -> Esegui.
 *    Google chiede l'autorizzazione: "Rivedi autorizzazioni" -> account ->
 *    "Avanzate" -> "Vai a ... (non sicuro)" -> "Consenti".
 *    E' normale: stai autorizzando il TUO script sul TUO account.
 * 5. IMPORTANTE, visto che lo script esisteva gia':
 *    "Esegui il deployment" -> "Gestisci deployment" -> matita ->
 *    Versione: "Nuova versione" -> "Esegui il deployment".
 *    L'URL non cambia, quindi in hugo.toml non devi toccare niente.
 *
 * Se invece parti da zero: "Nuovo deployment" -> App web ->
 * Esegui come: Me · Chi ha accesso: Chiunque -> copia l'URL /exec
 * in hugo.toml alla voce listaAttesaEndpoint.
 */

const EMAIL_NOTIFICA = 'zonerosse@gmail.com';   // <-- la tua email
const NOME_FILE = 'Prenotazioni cuccioli - Del Piccolo Diavolo';
const NOME_FOGLIO = 'Richieste';

/* La chiave e' diversa da quella della lista d'attesa: cosi' lo script
   crea un foglio nuovo invece di scrivere in fondo a quello vecchio. */
const CHIAVE_FOGLIO = 'SHEET_ID_PRENOTA';

const INTESTAZIONI = [
  'Data', 'Nome', 'Email', 'Telefono', 'Paese e citta\'',
  'Il cucciolo', 'Esperienza', 'Dove vivra\' il cane',
  'Stato', 'Provenienza'
];

/** Restituisce il foglio, creandolo la prima volta. */
function getFoglio_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty(CHIAVE_FOGLIO);
  let ss = null;
  let appenaCreato = false;

  if (id) {
    try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; }
  }

  if (!ss) {
    ss = SpreadsheetApp.create(NOME_FILE);
    props.setProperty(CHIAVE_FOGLIO, ss.getId());
    appenaCreato = true;
  }

  let sheet = ss.getSheetByName(NOME_FOGLIO);
  if (!sheet) {
    sheet = ss.getSheets()[0];
    sheet.setName(NOME_FOGLIO);
  }

  /* Se il foglio e' vuoto, scrivo le intestazioni. */
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(INTESTAZIONI);
    sheet.getRange(1, 1, 1, INTESTAZIONI.length)
      .setFontWeight('bold')
      .setBackground('#5c4a3a')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 140);   // Data
    sheet.setColumnWidth(2, 170);   // Nome
    sheet.setColumnWidth(3, 200);   // Email
    sheet.setColumnWidth(5, 160);   // Paese e citta'
    sheet.setColumnWidth(6, 220);   // Il cucciolo
    sheet.setColumnWidth(8, 360);   // Dove vivra' il cane
  }

  if (appenaCreato && EMAIL_NOTIFICA) {
    MailApp.sendEmail({
      to: EMAIL_NOTIFICA,
      subject: 'Prenotazioni cuccioli - foglio creato',
      body: 'Il foglio delle prenotazioni e\' stato creato nel tuo Google Drive.\n\n'
          + 'Lo trovi qui:\n' + ss.getUrl()
          + '\n\nOgni invio dal modulo /prenota/ diventa una nuova riga.'
    });
  }

  return { sheet: sheet, ss: ss };
}

function doPost(e) {
  try {
    const d = (e && e.parameter) ? e.parameter : {};

    // scarto i bot: campo honeypot compilato
    if (d.azienda) {
      return ContentService.createTextOutput(JSON.stringify({ ok: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const r = getFoglio_();

    r.sheet.appendRow([
      new Date(),
      d.nome || '',
      d.email || '',
      d.telefono || '',
      d.paese || '',
      d.sesso || '',
      d.esperienza || '',
      d.note || '',
      'Nuova',
      d.pagina || ''
    ]);

    if (EMAIL_NOTIFICA) {
      const provenienza = d.paese ? (' - ' + d.paese) : '';
      MailApp.sendEmail({
        to: EMAIL_NOTIFICA,
        subject: 'Prenotazione - ' + (d.nome || 'nuova richiesta') + provenienza,
        replyTo: d.email || EMAIL_NOTIFICA,
        body:
          'Nuova prenotazione dal sito.\n\n' +
          'Nome: '           + (d.nome || '-') + '\n' +
          'Email: '          + (d.email || '-') + '\n' +
          'Telefono: '       + (d.telefono || '-') + '\n' +
          'Paese e citta\': ' + (d.paese || '-') + '\n' +
          'Il cucciolo: '    + (d.sesso || '-') + '\n' +
          'Esperienza: '     + (d.esperienza || '-') + '\n\n' +
          'Dove vivra\' il cane:\n' + (d.note || '-') + '\n\n' +
          'Pagina: ' + (d.pagina || '-') + '\n\n' +
          'Foglio completo: ' + r.ss.getUrl()
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    try {
      MailApp.sendEmail(EMAIL_NOTIFICA,
        'Prenotazioni - ERRORE',
        'Errore: ' + err + '\n\nDati ricevuti:\n' + JSON.stringify(e && e.parameter));
    } catch (e2) {}
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('Endpoint prenotazioni attivo.');
}

/**
 * Lancia questa funzione dall'editor (menu Esegui) per creare subito
 * il foglio e ricevere il link via email.
 */
function creaFoglioAdesso() {
  const r = getFoglio_();
  Logger.log('Foglio pronto: ' + r.ss.getUrl());
}
