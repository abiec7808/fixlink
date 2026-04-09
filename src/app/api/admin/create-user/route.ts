import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, role } = await req.json();

    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!adminAuth) {
      return NextResponse.json({ error: 'Firebase Admin not initialized.' }, { status: 500 });
    }

    // 1. Create the user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: fullName,
    });

    // 2. Set custom claims for role
    await adminAuth.setCustomUserClaims(userRecord.uid, { role });

    // 3. Create the user profile in Firestore
    if (adminDb) {
      await adminDb.collection('users').doc(userRecord.uid).set({
        email,
        fullName,
        role,
        onboardingCompleted: true, // Admin-created users are pre-onboarded
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        serviceRadius: role === 'tradesman' ? 70 : null, // Default radius
      });
    }

    return NextResponse.json({ 
      success: true, 
      uid: userRecord.uid 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating user via Admin API:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create user.' 
    }, { status: 500 });
  }
}
