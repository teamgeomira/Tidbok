const instrumentFirebaseConfig = {
  projectId: "skolaraport",
  databaseURL: "https://skolaraport-default-rtdb.europe-west1.firebasedatabase.app",
  serviceAccount: {
    type: "service_account",
    project_id: "skolaraport",
    private_key_id: "82f65231c9fc09e4e0951b894db1aeef545ecc2a",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC7M7gGMQQLfesJ\nS6+Pz8Zeakw6O/M/E50rFS2XVmGLlN7K2CJfkGjMIoRla3fEl+vJs1iQnfM4s1u8\nXJg6JmSbbe1g8He+vkZYBVxT6cR/gF5GlwOO1DehvL69fgn7axD4aRFzF/nKsXFm\n0+qUILoPG9XZZ9VjHDp0ZrtmKraUGlKSwMjJOUerBkxiEQjwa4/ZlnkZ9dzp9yzp\nuZF6w+N0Y4dDXdU4d7pqnr4XY6IUkwg65flfgv0qFFq8+G4fEvgTChkZeRAzykId\nJcQyOVxVAVK9PGTzXKCrK1xwqNu8By88HZC39f93Ew/PqrJzF1PJMRG1wYkYB4wH\n2jZ57c6/AgMBAAECggEACLSD3xec3IoqdEWKEHAqWqbyU52W83lHWp9NfhrFxnTD\njM3hDt+yeMD80q4WAXiQ2l/ZinjxZu9edgjIQoTgTwZyfoqh41G067PQjtu4ebcl\nHPCPB5MOxP1NCkHinrmAvIVbmQmltx0Gl6H3kpPRPcqe6Hvd04PPpBBIPpzkFtbs\nTuS6oKE+fz5/SDz8uqDlf/740tQSy2nCChH5otnXly8h5cle6UJcokAWteRohsc1\nOP5qI4JnEWVQDIylNlmfTGN0T5Bik+OC3Bwg91TPYp1tS27MQB1yRFVOSv2wKvUg\nRa0Cphzmp1oaIY+6nRzDN2qXxKenSN71IuMGlWQfIQKBgQDuE881tNQi2POq5kVR\noyqzmbl8sFLTmkDKP8zbsIVjOq4VEwMJ8u6ItzfH6KMktJH70yhOOZPs8srDynNH\njw18kDz0StoEhgobY/hat2sSTB1h1MedGR/e24oZSgU67CNugvRZM+qaC0guMBJw\n+wQtLZLzvznLSFZ/SfeA2WAJBQKBgQDJS3KMUe63/OxplrDnTvI5Urbyx062LJJs\nMspQD1GY92YOunC5pytwQjgZ7n/PgPSBDrEyeNhCfA/vuITtkCgaH78oz0WsrYAd\ny4TLo5y0j1ZEBCZ69fu+tlDip5fAfehCondUct8Ns7WNDXZN58GV4sYYgDE+Tv/O\nM5YgLlhz8wKBgQCxxUjsKWJdwvHvopIQK24vPZIrcN3n8z59xrYJNP3k4mQqiE+0\nlhlXLLgSJbvsJIj9KObnwkaan5CYMgtyW3cOlAVvxJSW3B+f5D4GPv9MYlluO5vx\nyljp57Ruvb66CKlMU6xxDzsWW2ZCVtLuWgD8WxNnvlpBWHp+AZU2ORpkoQKBgQDF\n6CndEAj2V/NP9NpE8PdxqIM6uv4GWlgzjNQgVo9RJ5vtyxxdS6CHpHNn+3cp2o2J\n/Zn2F5337+XzOKVotBzZYnEdfHvyRDr8EEaluFyvoWWdRb9XkVVLshBgZ4nptWCP\ncxCDtNTcsd1DqwKvobZQ2T8Og6rmqeETKODnDunkRQKBgQDOOYCMSnezvXIUHWWp\nscxRRKd91HRJTfVubX8VAYx3kYHyi/hEgLQUOtrmaseCu8YUI9vHYCRMiYoQp1cU\nFcJ946qWVt0icEbvwZX5VnmAskTJ4lAJlN/RmGsUCZxnHv5kr+OH7FmKuGZJlD0A\nET4Vhhj5aPj1rQY6qYsmnAhrKA==\n-----END PRIVATE KEY-----\n",
    client_email: "firebase-adminsdk-fbsvc@skolaraport.iam.gserviceaccount.com",
    client_id: "103416026327726504653",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40skolaraport.iam.gserviceaccount.com"
  }
};

let accessToken = null;
let tokenExpiry = 0;

const calibrationMessages = {
  sv: {
    title: "Kalibreringspåminnelse",
    missingSingle: (name) => `Det har konstaterats att instrumentet ${name} saknar registrerad kalibrering för innevarande månad.`,
    missingMultiple: (count, names) => `Det har konstaterats att följande instrument saknar registrerad kalibrering för innevarande månad (efter den 2:a): ${names}.`,
    action: "Vänligen kontrollera dess status och utför nödvändig kalibrering eller registrera saknad information.",
    calibrate: "Kalibrera nu",
    dismiss: "Stäng",
    switchToEs: "Español"
  },
  es: {
    title: "Recordatorio de Calibración",
    missingSingle: (name) => `Se ha detectado que el instrumento ${name} no cuenta con registro de calibración vigente para el presente mes.`,
    missingMultiple: (count, names) => `Se ha detectado que los siguientes instrumentos no cuentan con registro de calibración vigente para el presente mes (posterior al día 2): ${names}.`,
    action: "Se solicita, por favor, verificar su estado y realizar la calibración correspondiente o registrar la información faltante.",
    calibrate: "Calibrar ahora",
    dismiss: "Cerrar",
    switchToSv: "Svenska"
  }
};

let currentLang = 'sv';

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;
  const header = { alg: "RS256", typ: "JWT", kid: instrumentFirebaseConfig.serviceAccount.private_key_id };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: instrumentFirebaseConfig.serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email",
    aud: instrumentFirebaseConfig.serviceAccount.token_uri,
    exp: now + 3600,
    iat: now
  };
  const privateKey = instrumentFirebaseConfig.serviceAccount.private_key;
  const pem = privateKey.replace(/\\n/g, "\n");
  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const claimB64 = btoa(JSON.stringify(claim)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const signatureInput = `${headerB64}.${claimB64}`;
  const keyData = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, "");
  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey("pkcs8", binaryKey, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, encoder.encode(signatureInput));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const jwt = `${signatureInput}.${signatureB64}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
  return accessToken;
}

async function fetchFromDatabase(path) {
  const token = await getAccessToken();
  const url = `${instrumentFirebaseConfig.databaseURL}${path}.json?access_token=${token}`;
  const response = await fetch(url);
  return response.json();
}

function createModal(instrumentList) {
  const existingModal = document.getElementById('calibration-reminder-modal');
  if (existingModal) existingModal.remove();

  const t = calibrationMessages[currentLang];
  const instrumentCount = instrumentList.length;
  const instrumentText = instrumentList.join(', ');
  const missingMessage = instrumentCount === 1 ? t.missingSingle(instrumentText) : t.missingMultiple(instrumentCount, instrumentText);

  const overlay = document.createElement('div');
  overlay.id = 'calibration-reminder-modal';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(5px);
    display: flex; align-items: center; justify-content: center; z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;

  const modal = document.createElement('div');
  modal.style.cssText = `
    background: white; border-radius: 20px; padding: 32px; max-width: 550px; width: 90%;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: slideUp 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  const icon = document.createElement('div');
  icon.style.cssText = `
    width: 64px; height: 64px; margin: 0 auto 24px;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
  `;
  icon.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: white; font-size: 32px;"></i>';

  const title = document.createElement('h2');
  title.style.cssText = `font-size: 22px; font-weight: 700; color: #1f2937; text-align: center; margin-bottom: 20px;`;
  title.textContent = t.title;

  const messageContainer = document.createElement('div');
  messageContainer.style.cssText = `margin-bottom: 20px;`;

  const missingPara = document.createElement('p');
  missingPara.style.cssText = `color: #374151; font-size: 15px; line-height: 1.5; margin-bottom: 12px;`;
  missingPara.textContent = missingMessage;

  const actionPara = document.createElement('p');
  actionPara.style.cssText = `color: #4b5563; font-size: 14px; line-height: 1.5; margin-bottom: 16px;`;
  actionPara.textContent = t.action;

  const instrumentBox = document.createElement('div');
  instrumentBox.style.cssText = `
    background: #fef3c7; border: 1px solid #fde68a; border-radius: 10px;
    padding: 14px; margin-top: 8px; max-height: 130px; overflow-y: auto;
  `;
  const instrumentLabel = document.createElement('div');
  instrumentLabel.style.cssText = `font-size: 12px; font-weight: 600; color: #92400e; margin-bottom: 6px;`;
  instrumentLabel.textContent = currentLang === 'sv' ? 'Berörda instrument:' : 'Instrumentos afectados:';
  const instrumentNamesDiv = document.createElement('div');
  instrumentNamesDiv.style.cssText = `font-size: 14px; color: #78350f; word-break: break-word;`;
  instrumentNamesDiv.textContent = instrumentText;
  instrumentBox.appendChild(instrumentLabel);
  instrumentBox.appendChild(instrumentNamesDiv);

  messageContainer.appendChild(missingPara);
  messageContainer.appendChild(actionPara);
  messageContainer.appendChild(instrumentBox);

  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `display: flex; gap: 12px; justify-content: flex-end; margin-top: 28px;`;

  const langButton = document.createElement('button');
  langButton.style.cssText = `
    background: transparent; border: 1px solid #d1d5db; color: #4b5563;
    padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 500;
    cursor: pointer; transition: all 0.2s; margin-right: auto;
  `;
  langButton.textContent = currentLang === 'sv' ? t.switchToEs : calibrationMessages.es.switchToSv;
  langButton.onmouseover = () => langButton.style.background = '#f3f4f6';
  langButton.onmouseout = () => langButton.style.background = 'transparent';
  langButton.onclick = () => {
    currentLang = currentLang === 'sv' ? 'es' : 'sv';
    createModal(instrumentList);
  };

  const primaryButton = document.createElement('button');
  primaryButton.style.cssText = `
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border: none; color: white; padding: 10px 24px; border-radius: 8px;
    font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;
    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
  `;
  primaryButton.textContent = t.calibrate;
  primaryButton.onmouseover = () => { primaryButton.style.transform = 'translateY(-1px)'; primaryButton.style.boxShadow = '0 8px 12px -2px rgba(59, 130, 246, 0.3)'; };
  primaryButton.onmouseout = () => { primaryButton.style.transform = 'translateY(0)'; primaryButton.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.2)'; };
  primaryButton.onclick = () => {
    window.open('https://teamgeomira.github.io/Instrumenthanteringuser/', '_blank');
    overlay.remove();
  };

  const dismissButton = document.createElement('button');
  dismissButton.style.cssText = `
    background: transparent; border: 1px solid #d1d5db; color: #6b7280;
    padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 500;
    cursor: pointer; transition: all 0.2s;
  `;
  dismissButton.textContent = t.dismiss;
  dismissButton.onmouseover = () => dismissButton.style.background = '#f3f4f6';
  dismissButton.onmouseout = () => dismissButton.style.background = 'transparent';
  dismissButton.onclick = () => overlay.remove();

  buttonContainer.appendChild(langButton);
  buttonContainer.appendChild(primaryButton);
  buttonContainer.appendChild(dismissButton);

  modal.appendChild(icon);
  modal.appendChild(title);
  modal.appendChild(messageContainer);
  modal.appendChild(buttonContainer);
  overlay.appendChild(modal);

  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `;
  overlay.appendChild(style);
  document.body.appendChild(overlay);
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

async function checkCalibrationReminders() {
  const user = firebase.auth().currentUser;
  if (!user?.email) return;

  try {
    const allInstruments = await fetchFromDatabase('/instruments') || {};
    const userInstruments = Object.entries(allInstruments)
      .filter(([id, inst]) => (inst.reference || '').toUpperCase() === user.email.toUpperCase())
      .map(([id, inst]) => ({ id, ...inst }));

    if (!userInstruments.length) return;

    const calibrations = await fetchFromDatabase('/calibrations') || {};
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    if (currentDay <= 2) return;

    const missing = [];
    for (const inst of userInstruments) {
      const instName = inst.product || inst.name || 'Okänt instrument';
      const isTotalStation = instName.toUpperCase().includes('TS') || 
                             instName.toUpperCase().includes('TOTALSTATION') ||
                             instName.toUpperCase().includes('TOTAL STATION') ||
                             (!instName.toUpperCase().includes('GPS') && 
                              !instName.toUpperCase().includes('GS') && 
                              !instName.toUpperCase().includes('CONTROLLER') &&
                              !instName.toUpperCase().includes('CLOUDWORX') &&
                              !instName.toUpperCase().includes('RADIOHANDLE'));
      if (!isTotalStation) continue;

      const hasCalibration = Object.values(calibrations).some(cal => 
        String(cal.instrumentId) === String(inst.id) && cal.year === currentYear && cal.month === currentMonth && cal.passed === true
      );
      if (!hasCalibration) missing.push(instName);
    }

    if (missing.length) createModal(missing);
  } catch (error) {
    console.error('❌ Error al verificar calibraciones:', error);
  }
}

firebase.auth().onAuthStateChanged((user) => {
  if (user) setTimeout(checkCalibrationReminders, 2000);
});
