/**
 * LISTA D'ATTESA — Del Piccolo Diavolo
 * Riceve i dati dal form del sito e li scrive in questo Foglio Google.
 * Invia anche una notifica email a ogni nuova richiesta.
 *
 * INSTALLAZIONE (una volta sola, ~10 minuti)
 * ------------------------------------------
 * 1. Vai su drive.google.com -> Nuovo -> Google Fogli. Chiamalo "Lista attesa cuccioli".
 * 2. Nel foglio: menu Estensioni -> Apps Script.
 * 3. Cancella il codice di esempio e incolla TUTTO questo file.
 * 4. Modifica la riga EMAIL_NOTIFICA qui sotto con la tua email.
 * 5. Salva (icona floppy).
 * 6. In alto a destra: Deploy -> Nuovo deployment.
 *    - Icona ingranaggio -> Tipo: "App web"
 *    - Esegui come: "Me"
 *    - Chi ha accesso: "Chiunque"          <-- importante
 *    - Deploy
 * 7. Google chiede l'autorizzazione: Consenti (passa da "Avanzate" ->
 *    "Vai a ... (non sicuro)": e' normale, e' il TUO script sul TUO account).
 * 8. Copia l'URL che finisce con /exec e incollalo in hugo.toml:
 *       [params]
 *         listaAttesaEndpoint = "https://script.google.com/macros/s/AKfy.../exec"
 *
 * Da quel momento ogni invio dal sito compare come nuova riga nel foglio.
 * Se in futuro modifichi questo script: Deploy -> Gestisci deployment ->
 * matita -> Versione: Nuova -> Deploy (l'URL resta lo stesso).
 */

const EMAIL_NOTIFICA = 'zonerosse@gmail.com';   // <-- METTI QUI LA TUA EMAIL
const NOME_FOGLIO = 'Richieste';

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(NOME_FOGLIO);

    // prima esecuzione: crea il foglio e l'intestazione
    if (!sheet) {
      sheet = ss.insertSheet(NOME_FOGLIO);
      sheet.appendRow([
        'Data', 'Nome', 'Email', 'Telefono', 'Lingua',
        'Cosa cerca', 'Sesso preferito', 'Tempi',
        'Esperienza', 'Note', 'Stato', 'Provenienza'
      ]);
      const h = sheet.getRange(1, 1, 1, 12);
      h.setFontWeight('bold').setBackground('#5c4a3a').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
      sheet.setColumnWidth(10, 320);
    }

    const d = e.parameter || {};

    sheet.appendRow([
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

    // notifica email
    if (EMAIL_NOTIFICA) {
      const corpo =
        'Nuova richiesta per la lista d\'attesa.\n\n' +
        'Nome: ' + (d.nome || '-') + '\n' +
        'Email: ' + (d.email || '-') + '\n' +
        'Telefono: ' + (d.telefono || '-') + '\n' +
        'Lingua: ' + (d.lingua || 'it') + '\n' +
        'Cosa cerca: ' + (d.scopo || '-') + '\n' +
        'Sesso preferito: ' + (d.sesso || '-') + '\n' +
        'Tempi: ' + (d.tempi || '-') + '\n' +
        'Esperienza: ' + (d.esperienza || '-') + '\n\n' +
        'Note:\n' + (d.note || '-') + '\n\n' +
        'Pagina di provenienza: ' + (d.pagina || '-') + '\n\n' +
        'Foglio: ' + ss.getUrl();

      MailApp.sendEmail({
        to: EMAIL_NOTIFICA,
        subject: 'Lista attesa cuccioli — ' + (d.nome || 'nuova richiesta'),
        body: corpo,
        replyTo: d.email || EMAIL_NOTIFICA
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('Endpoint attivo.');
}
