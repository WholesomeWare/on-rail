import { signInWithPopup, GoogleAuthProvider, getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { app } from '$lib/firebase';

const auth = getAuth(app);

let currentUser: User | null = $state(null);

onAuthStateChanged(auth, (u) => {
    currentUser = u;
});

export { currentUser };

export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    
    try {
        const result = await signInWithPopup(auth, provider);

        return result.user;
    } catch (error) {
        console.error('Error signing in with Google:', error);
        throw error;
    }
}

export async function signOut() {
    await auth.signOut();
}