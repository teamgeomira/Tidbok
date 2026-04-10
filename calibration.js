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

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }
  
  const header = {
    alg: "RS256",
    typ: "JWT",
    kid: instrumentFirebaseConfig.serviceAccount.private_key_id
  };
  
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
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(signatureInput)
  );
  
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  
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

async function checkCalibrationReminders() {
  console.log('🔍 FUNCIÓN checkCalibrationReminders EJECUTADA');
  
  const user = firebase.auth().currentUser;
  if (!user) {
    console.log('❌ No hay usuario logueado en la app principal');
    return;
  }
  
  const userEmail = user.email;
  if (!userEmail) {
    console.log('❌ Usuario sin email');
    return;
  }
  
  console.log('📧 Email del usuario:', userEmail);
  
  try {
    console.log('📡 Conectando a Firebase instrumentos (via REST API)...');
    const allInstruments = await fetchFromDatabase('/instruments') || {};
    console.log('📦 Cantidad de instrumentos:', Object.keys(allInstruments).length);
    
    const userInstruments = Object.entries(allInstruments)
      .filter(([id, inst]) => {
        const ref = (inst.reference || '').toUpperCase();
        const emailUpper = userEmail.toUpperCase();
        const match = ref === emailUpper;
        console.log(`  Comparando: ref="${ref}" con email="${emailUpper}" -> ${match ? '✅ COINCIDE' : '❌ NO COINCIDE'}`);
        return match;
      })
      .map(([id, inst]) => ({ id, ...inst }));
    
    console.log('🔧 Instrumentos asignados al usuario:', userInstruments.length);
    
    if (userInstruments.length === 0) {
      console.log('⚠️ NO HAY INSTRUMENTOS ASIGNADOS - Saliendo');
      return;
    }
    
    console.log('📅 Obteniendo calibraciones...');
    const calibrations = await fetchFromDatabase('/calibrations') || {};
    console.log('📋 Cantidad de calibraciones:', Object.keys(calibrations).length);
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    
    console.log(`📆 FECHA ACTUAL: ${currentYear}-${currentMonth}-${currentDay}`);
    console.log(`📆 Día actual: ${currentDay} - ${currentDay <= 22 ? 'NO se muestra alarma (día <= 22)' : 'SÍ se muestra alarma (día > 22)'}`);
    
    if (currentDay <= 22) {
      console.log('⏸️ Saliendo porque es día 22 o menor');
      return;
    }
    
    const missingCalibrationInstruments = [];
    
    for (const inst of userInstruments) {
      const instName = inst.product || inst.name || 'Okänt instrument';
      console.log(`\n🔍 REVISANDO INSTRUMENTO: ${instName} (ID: ${inst.id})`);
      
      const isTotalStation = instName.toUpperCase().includes('TS') || 
                             instName.toUpperCase().includes('TOTALSTATION') ||
                             instName.toUpperCase().includes('TOTAL STATION') ||
                             (!instName.toUpperCase().includes('GPS') && 
                              !instName.toUpperCase().includes('GS') && 
                              !instName.toUpperCase().includes('CONTROLLER') &&
                              !instName.toUpperCase().includes('CLOUDWORX') &&
                              !instName.toUpperCase().includes('RADIOHANDLE'));
      
      console.log(`  ¿Es Total Station?: ${isTotalStation}`);
      
      if (!isTotalStation) {
        console.log(`  ⏭️ NO es totalstation, ignorando`);
        continue;
      }
      
      console.log(`  Buscando calibraciones para año=${currentYear}, mes=${currentMonth}, instrumentId=${inst.id}`);
      
      let foundCalibration = null;
      for (const calId in calibrations) {
        const cal = calibrations[calId];
        if (String(cal.instrumentId) === String(inst.id) && 
            cal.year === currentYear && 
            cal.month === currentMonth) {
          foundCalibration = cal;
          console.log(`    ✅ ENCONTRADA calibración para este mes: passed=${cal.passed}`);
          break;
        }
      }
      
      if (!foundCalibration) {
        console.log(`  ❌ NO HAY calibración para este mes`);
        missingCalibrationInstruments.push(instName);
      } else if (!foundCalibration.passed) {
        console.log(`  ❌ Calibración NO APROBADA`);
        missingCalibrationInstruments.push(instName);
      } else {
        console.log(`  ✅ Calibración APROBADA - OK`);
      }
    }
    
    console.log('⚠️ Instrumentos sin calibrar:', missingCalibrationInstruments);
    
    if (missingCalibrationInstruments.length > 0) {
      const instrumentList = missingCalibrationInstruments.join(', ');
      const message = `⚠️ Påminnelse: Kalibrering saknas för ${missingCalibrationInstruments.length} instrument (efter den 22:a). Kontrollera: ${instrumentList}`;
      
      const alertContainer = document.getElementById('alert-container');
      if (alertContainer) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-warning fade-in';
        alertDiv.style.backgroundColor = '#fef3c7';
        alertDiv.style.color = '#92400e';
        alertDiv.style.border = '1px solid #fde68a';
        alertDiv.innerHTML = `
          <div class="flex items-center justify-between">
            <span><i class="fas fa-exclamation-triangle mr-2"></i>${message}</span>
            <button class="text-gray-600 hover:text-gray-800" onclick="this.parentElement.parentElement.remove()">&times;</button>
          </div>
        `;
        alertContainer.appendChild(alertDiv);
      }
    } else {
      console.log('✅ Todos los instrumentos tienen calibración aprobada este mes');
    }
  } catch (error) {
    console.error('❌ Error al verificar calibraciones:', error);
  }
}

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    setTimeout(() => checkCalibrationReminders(), 2000);
  }
});

console.log('✅ calibration.js laddat - övervakar kalibreringspåminnelser (via REST API)');
