# Tasks GTD – versione per Android

App web installabile (PWA) per usare **Google Tasks con gli strumenti GTD** sul telefono. Legge e scrive le stesse attività dell'estensione Firefox *Google Tasks a schermo intero* e usa le stesse convenzioni:
- elenchi GTD (INBOX, PROSSIME AZIONI, PROGETTI, IN ATTESA, UN GIORNO - FORSE);
- `@contesti` nel titolo;
- riga `⏳ In attesa dal …` nelle note per le deleghe.

## Cosa offre
- **Barra in basso**: Oggi · Elenchi · INBOX · Cerca · Altro. Il pulsante **+ Nuova** è sempre a portata di pollice.
- **Oggi**: riepilogo (scadute, oggi, INBOX, deleghe da sollecitare) e attività in scadenza.
- **Elabora INBOX**: una voce alla volta, con scelte colorate compatte. C'è anche **Da leggere** (se esiste un elenco come "DA LEGGERE - VERIFICARE"; si imposta in Impostazioni → GTD) e **Altro elenco…** per scegliere tra tutti gli elenchi.
- **Revisione settimanale**, **Contesti**, **Deleghe in corso**, **Ricerca** con le ultime 5 ricerche.
- Nei risultati della ricerca le **sottoattività** sono rientrate, con barra blu ed etichetta; se l'attività principale non contiene le parole cercate compare sopra in grigio come *Attività di riferimento*.
- Nel **dettaglio di un'attività** si passa alla precedente/successiva **scorrendo il dito a sinistra o a destra** (o con le frecce ‹ › in alto, con "2 di 5"), nell'ordine della schermata da cui l'hai aperta; *Indietro* torna all'elenco.
- **Sottoattività richiudibili**: freccetta a destra dell'attività; nell'elenco Progetti partono chiuse, altrove aperte; da chiuse si vede quante sono e quante sono scadute. Menu ⋮ dell'elenco → *Chiudi / Apri tutte*.
- In **Elabora INBOX** scorri a sinistra per saltare una voce, a destra per tornare a quella saltata.
- **Telefono in orizzontale**: barra gialla e pulsanti diventano una colonna stretta a sinistra e il contenuto usa tutta l'altezza dello schermo; il titolo della schermata compare in cima alla pagina.
- **Cambiare elenco al volo**: dentro un elenco tocca il suo nome nella barra gialla (con la freccetta ▾) e scegli un altro elenco.
- **Esporta / copia** (dai risultati della ricerca, dal menu ⋮ di un elenco o da *Altro*): testo semplice o **Markdown** in un riquadro, con *Copia tutto*, *Condividi* (WhatsApp, email, Keep…) e *Scarica*.
- **Gesti sulle attività**:
  - scorri a destra per completare;
  - scorri a sinistra o tieni premuto per le azioni (scadenza, sposta, delega, elimina);
  - ogni gesto ha anche un pulsante equivalente.
- **Leggibilità**:
  - testo da 85% a 160%, che segue anche la dimensione impostata in Chrome;
  - carattere Atkinson Hyperlegible e modalità "Alta leggibilità";
  - tema chiaro/scuro;
  - aree da toccare di almeno 48 px;
  - contrasto almeno 4,5:1;
  - verificata da 360 px di larghezza con testo al 160%.
- **Senza rete**: mostra le ultime attività salvate. Le modifiche restano in coda e partono appena torna la connessione.
- **Condividi → Tasks GTD**: da qualsiasi app Android, testo o link diventano una nuova attività nella INBOX.
- Il tasto **Indietro** di Android funziona dentro l'app.
- **Cambio account rapido**: tocca l'avatar in alto a destra. Gli account già usati sul telefono si attivano con un tocco; da lì puoi anche aggiungerne uno o uscire.

## Pubblicazione (una volta sola)
L'app deve stare su un indirizzo `https`. Il modo gratuito più semplice è **GitHub Pages**.

1. **ID client**: apri `config.js` e incolla tra gli apici lo stesso ID client OAuth dell'estensione (`….apps.googleusercontent.com`). Non è un dato segreto.
2. **GitHub Desktop** → *File → Add local repository* → scegli questa cartella. Se propone di crearlo, scegli *create a repository*. Poi **Publish repository**, **togliendo la spunta "Keep this code private"**: GitHub Pages gratuito funziona solo con repository pubblici. Il codice non contiene dati personali né chiavi.
3. Su github.com, nel repository: **Settings → Pages → Branch: `main` / `(root)` → Save**. Dopo un minuto l'app è su `https://TUO-UTENTE.github.io/google-tasks-mobile/`.
4. **Google Cloud** → Google Auth Platform → **Client** → apri lo stesso client dell'estensione e aggiungi:
   - in *Origini JavaScript autorizzate*: `https://TUO-UTENTE.github.io`
   - in *URI di reindirizzamento autorizzati*: `https://TUO-UTENTE.github.io/google-tasks-mobile/`

   Gli indirizzi esatti sono anche nell'app, in *Altro → Impostazioni → Configurazione*, con il pulsante **Copia**.

## Installazione sul telefono
1. Apri l'indirizzo con **Chrome** su Android.
2. **Accedi con Google** e spunta il permesso sulle attività. L'avviso "app non verificata" è normale: scegli *Continua*.
3. Menu **⋮** di Chrome → **Installa app** (o "Aggiungi a schermata Home").

L'icona compare tra le app. Tenendola premuta trovi le scorciatoie *Nuova attività*, *Oggi* ed *Elabora INBOX*.

## Aggiornamenti
Modifichi i file, poi fai **Commit** e **Push** in GitHub Desktop. Al successivo avvio l'app mostra "È disponibile una nuova versione → Aggiorna". Per forzare l'aggiornamento cambia anche `VERSION` in `sw.js`.

## Cosa resta sul telefono
Tema, dimensione del testo, ruoli GTD, contesti proposti e data dell'ultima revisione restano sul telefono e **non** si sincronizzano con l'estensione Firefox. Le attività, i contesti e le deleghe invece si sincronizzano sempre tramite Google.

## File
| File | Contenuto |
|---|---|
| `index.html`, `app.css`, `app.js` | L'app |
| `config.js` | ID client OAuth |
| `manifest.webmanifest` | Nome, icone, scorciatoie e "Condividi" per Android |
| `sw.js` | Funzionamento senza rete e aggiornamenti |
| `icons/`, `fonts/` | Icone e carattere Atkinson Hyperlegible (licenza `OFL.txt`) |
