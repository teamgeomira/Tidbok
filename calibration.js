const instrumentFirebaseConfig = {
  apiKey: "AIzaSyDCkm9d4vIa9H52dCIMgyiGDcXWh9y3Ruk",
  authDomain: "skolaraport.firebaseapp.com",
  databaseURL: "https://skolaraport-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "skolaraport",
  storageBucket: "skolaraport.appspot.com",
  messagingSenderId: "720242828475",
  appId: "1:720242828475:web:7c5f7d3e1c34d1c9d7a8d4"
};

let instrumentApp;
let instrumentDatabase;

try {
  instrumentApp = firebase.initializeApp(instrumentFirebaseConfig, "instrumentApp");
} catch (e) {
  instrumentApp = firebase.app("instrumentApp");
}
instrumentDatabase = instrumentApp.database();

async function ensureInstrumentAuth() {
  const auth = instrumentApp.auth();
  if (auth.currentUser) return;
  try {
    await auth.signInAnonymously();
    console.log('✅ Anonym inloggning i instrumentApp lyckades');
  } catch (e) {
    console.warn('⚠️ Kunde inte logga in anonymt:', e);
  }
}

async function checkCalibrationReminders() {
  console.log('🔍 FUNKTION checkCalibrationReminders KÖRS');
  
  const user = firebase.auth().currentUser;
  if (!user) {
    console.log('❌ Ingen användare inloggad i huvudappen');
    return;
  }
  
  const userEmail = user.email;
  if (!userEmail) {
    console.log('❌ Användaren saknar e-post');
    return;
  }
  
  console.log('📧 Användarens e-post:', userEmail);
  
  try {
    await ensureInstrumentAuth();
    
    console.log('📡 Hämtar instrument från skolaraport...');
    const instrumentsSnap = await instrumentDatabase.ref('instruments').once('value');
    const allInstruments = instrumentsSnap.val() || {};
    console.log('📦 Antal instrument totalt:', Object.keys(allInstruments).length);
    
    const userInstruments = Object.entries(allInstruments)
      .filter(([id, inst]) => {
        const ref = (inst.reference || '').toUpperCase();
        const emailUpper = userEmail.toUpperCase();
        const match = ref === emailUpper;
        console.log(`  Jämför: ref="${ref}" med e-post="${emailUpper}" -> ${match ? '✅ TRÄFF' : '❌ INGEN TRÄFF'}`);
        return match;
      })
      .map(([id, inst]) => ({ id, ...inst }));
    
    console.log('🔧 Användarens instrument:', userInstruments.length);
    
    if (userInstruments.length === 0) {
      console.log('⚠️ INGA INSTRUMENT TILLDELADE - Avslutar');
      return;
    }
    
    console.log('📅 Hämtar kalibreringar...');
    const calibrationsSnap = await instrumentDatabase.ref('calibrations').once('value');
    const calibrations = calibrationsSnap.val() || {};
    console.log('📋 Antal kalibreringar totalt:', Object.keys(calibrations).length);
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    
    console.log(`📆 DAGENS DATUM: ${currentYear}-${currentMonth}-${currentDay}`);
    console.log(`📆 Dag: ${currentDay} - ${currentDay <= 22 ? 'Ingen påminnelse (dag <= 22)' : 'Påminnelse visas (dag > 22)'}`);
    
    if (currentDay <= 22) {
      console.log('⏸️ Avslutar eftersom dagen är 22 eller mindre');
      return;
    }
    
    const missingCalibrationInstruments = [];
    
    for (const inst of userInstruments) {
      const instName = inst.product || inst.name || 'Okänt instrument';
      console.log(`\n🔍 KONTROLLERAR INSTRUMENT: ${instName} (ID: ${inst.id})`);
      
      const isTotalStation = instName.toUpperCase().includes('TS') || 
                             instName.toUpperCase().includes('TOTALSTATION') ||
                             instName.toUpperCase().includes('TOTAL STATION') ||
                             (!instName.toUpperCase().includes('GPS') && 
                              !instName.toUpperCase().includes('GS') && 
                              !instName.toUpperCase().includes('CONTROLLER') &&
                              !instName.toUpperCase().includes('CLOUDWORX') &&
                              !instName.toUpperCase().includes('RADIOHANDLE'));
      
      console.log(`  Är det en totalstation?: ${isTotalStation}`);
      
      if (!isTotalStation) {
        console.log(`  ⏭️ Hoppar över (ej totalstation)`);
        continue;
      }
      
      console.log(`  Letar efter kalibrering för år=${currentYear}, månad=${currentMonth}, instrumentId=${inst.id}`);
      
      let foundCalibration = null;
      for (const calId in calibrations) {
        const cal = calibrations[calId];
        if (String(cal.instrumentId) === String(inst.id) && 
            cal.year === currentYear && 
            cal.month === currentMonth) {
          foundCalibration = cal;
          console.log(`    ✅ KALIBRERING HITTAD: passed=${cal.passed}`);
          break;
        }
      }
      
      if (!foundCalibration) {
        console.log(`  ❌ SAKNAR kalibrering denna månad`);
        missingCalibrationInstruments.push(instName);
      } else if (!foundCalibration.passed) {
        console.log(`  ❌ Kalibrering EJ GODKÄND`);
        missingCalibrationInstruments.push(instName);
      } else {
        console.log(`  ✅ Kalibrering GODKÄND - OK`);
      }
    }
    
    console.log('⚠️ Instrument utan godkänd kalibrering:', missingCalibrationInstruments);
    
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
      console.log('✅ Alla totalstationer har godkänd kalibrering denna månad');
    }
  } catch (error) {
    console.error('❌ Fel vid kontroll av kalibreringar:', error);
  }
}

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    setTimeout(() => checkCalibrationReminders(), 2000);
  }
});

console.log('✅ calibration.js laddat - övervakar kalibreringspåminnelser');
