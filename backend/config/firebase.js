const admin = require('firebase-admin');

const initializeFirebase = () => {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        })
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