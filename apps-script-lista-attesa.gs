/**
 * LISTA D'ATTESA — Del Piccolo Diavolo
 *
 * Riceve i dati dal form del sito, li scrive in un foglio di calcolo
 * e invia una notifica email.
 *
 * NON devi creare nessun foglio: se non esiste, lo crea questo script
 * e ti manda il link via email.
 *
 * INSTALLAZIONE (5 minuti, una volta sola)
 * ----------------------------------------
 * 1. Nell'editor Apps Script: cancella tutto (Ctrl+A, Canc) e incolla
 *    questo file al suo posto.
 * 2. Controlla la riga EMAIL_NOTIFICA qui sotto.
 * 3. Salva con Ctrl+S. In alto puoi rinominare il progetto in
 *    "Lista attesa cuccioli".
 * 4. Menu Esegui: scegli la funzione "creaFoglioAdesso" e premi Esegui.
 *    Google chiede l'autorizzazione: "Rivedi autorizzazioni" -> scegli
 *    l'account -> "Avanzate" -> "Vai a ... (non sicuro)" -> "Consenti".
 *    E' normale: stai autorizzando il TUO script sul TUO account.
 *    Riceverai una email con il link del foglio appena creato.
 * 5. Clicca "Esegui il deployment" -> "Nuovo deployment".
 *    Icona ingranaggio -> "App web".
 *       Esegui come:     Me
 *       Chi ha accesso:  Chiunque      <-- fondamentale
 *    Clicca "Esegui il deployment".
 * 6. Copia "URL app web" (finisce con /exec) e incollalo in hugo.toml:
 *       listaAttesaEndpoint = "https://script.google.com/macros/s/.../exec"
 *
 * Se in futuro modifichi questo script:
 *   Esegui il deployment -> Gestisci deployment -> matita ->
 *   Versione: Nuova -> Esegui il deployment  (l'URL non cambia).
 */

const EMAIL_NOTIFICA = 'zonerosse@gmail.com';   // <-- la tua email
const NOME_FILE = 'Lista attesa cuccioli - Del Piccolo Diavolo';
const NOME_FOGLIO = 'Richieste';

/** Restituisce il foglio, creandolo la prima volta. */
function getFoglio_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('SHEET_ID');
  let ss = null;
  let appenaCreato = false;

  if (id) {
    try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; }
  }

  if (!ss) {
    ss = SpreadsheetApp.create(NOME_FILE);
    props.setProperty('SHEET_ID', ss.getId());
    appenaCreato = true;
  }

  let sheet = ss.getSheetByName(NOME_FOGLIO);
  if (!sheet) {
    sheet = ss.getSheets()[0];
    sheet.setName(NOME_FOGLIO);
    sheet.appendRow([
      'Data', 'Nome', 'Email', 'Telefono', 'Lingua',
      'Cosa cerca', 'Preferenza', 'Tempi',
      'Esperienza', 'Note', 'Stato', 'Provenienza'
    ]);
    sheet.getRange(1, 1, 1, 12)
      .setFontWeight('bold')
      .setBackground('#5c4a3a')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 140);
    sheet.setColumnWidth(2, 170);
    sheet.setColumnWidth(3, 200);
    sheet.setColumnWidth(10, 330);
  }

  if (appenaCreato && EMAIL_NOTIFICA) {
    MailApp.sendEmail({
      to: EMAIL_NOTIFICA,
      subject: 'Lista attesa cuccioli - foglio creato',
      body: "Il foglio della lista d'attesa e' stato creato automaticamente nel tuo Google Drive.\n\n"
          + 'Lo trovi qui:\n' + ss.getUrl()
          + '\n\nNon devi fare nulla: ogni richiesta dal sito diventa una nuova riga.'
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
      d.lingua || 'it',
      d.scopo || '',
      d.sesso || '',
      d.tempi || '',
      d.esperienza || '',
      d.note || '',
      'Nuovo',
      d.pagina || ''
    ]);

    if (EMAIL_NOTIFICA) {
      MailApp.sendEmail({
        to: EMAIL_NOTIFICA,
        subject: 'Lista attesa cuccioli - ' + (d.nome || 'nuova richiesta'),
        replyTo: d.email || EMAIL_NOTIFICA,
        body:
          "Nuova richiesta per la lista d'attesa.\n\n" +
          'Nome: '        + (d.nome || '-') + '\n' +
          'Email: '       + (d.email || '-') + '\n' +
          'Telefono: '    + (d.telefono || '-') + '\n' +
          'Lingua: '      + (d.lingua || 'it') + '\n' +
          'Cosa cerca: '  + (d.scopo || '-') + '\n' +
          'Preferenza: '  + (d.sesso || '-') + '\n' +
          'Tempi: '       + (d.tempi || '-') + '\n' +
          'Esperienza: '  + (d.esperienza || '-') + '\n\n' +
          'Note:\n' + (d.note || '-') + '\n\n' +
          'Pagina: ' + (d.pagina || '-') + '\n\n' +
          'Foglio completo: ' + r.ss.getUrl()
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    try {
      MailApp.sendEmail(EMAIL_NOTIFICA,
        'Lista attesa - ERRORE',
        'Errore: ' + err + '\n\nDati ricevuti:\n' + JSON.stringify(e && e.parameter));
    } catch (e2) {}
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('Endpoint lista attesa attivo.');
}

/**
 * Lancia questa funzione dall'editor (menu Esegui) per creare subito
 * il foglio e ricevere il link via email.
 */
function creaFoglioAdesso() {
  const r = getFoglio_();
  Logger.log('Foglio pronto: ' + r.ss.getUrl());
}
