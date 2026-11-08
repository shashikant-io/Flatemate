import * as admin from 'firebase-admin';
import { setGlobalOptions } from 'firebase-functions/v2';

admin.initializeApp();

setGlobalOptions({ region: 'asia-south1' });

export { joinFlat } from './joinFlat.js';
export { closeMonth } from './closeMonth.js';
