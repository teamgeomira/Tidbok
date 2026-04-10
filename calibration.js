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

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    instrumentApp.auth().updateCurrentUser(user).catch(e => console.warn("No se pudo sincronizar auth secundaria:", e));
  }
});

async function checkCalibrationReminders() {
  console.log('🔍 FUNCIÓN checkCalibrationReminders EJECUTADA');
  
  const user = firebase.auth().currentUser;
  if (!user) {
    console.log('❌ No hay usuario logueado');
    return;
  }
  
  const userEmail = user.email;
  if (!userEmail) {
    console.log('❌ Usuario sin email');
    return;
  }
  
  console.log('📧 Email del usuario:', userEmail);
  
  try {
    console.log('📡 Conectando a Firebase instrumentos...');
    const instrumentsSnap = await instrumentDatabase.ref('instruments').once('value');
    const allInstruments = instrumentsSnap.val() || {};
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
    const calibrationsSnap = await instrumentDatabase.ref('calibrations').once('value');
    const calibrations = calibrationsSnap.val() || {};
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

const originalInitApp = window.initApp;
if (typeof originalInitApp === 'function') {
  window.initApp = function() {
    originalInitApp();
    setTimeout(() => checkCalibrationReminders(), 2000);
  };
} else {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      setTimeout(() => checkCalibrationReminders(), 2000);
    }
  });
}

console.log('✅ calibration.js laddat - övervakar kalibreringspåminnelser');