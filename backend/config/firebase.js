const admin = require('firebase-admin');

const initializeFirebase = () => {
  try {
    if (!admin.apps.length) {
      const serviceAccount = require('./serviceAccountKey.json');
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('🔥 Firebase conectado!');
    }
    return admin.firestore();
  } catch (error) {
    console.error('❌ Erro Firebase:', error.message);
    throw error;
  }
};

module.exports = { initializeFirebase, admin };