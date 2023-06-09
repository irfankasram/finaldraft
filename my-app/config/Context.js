import {onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router'

export const AuthContext = createContext({});

export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider = ({children, }) => {

    const [temperature, setTemperature] = useState([]);
    const [waterflow, setWaterflow] = useState([]);
    const [waterturb, setWaterturb] = useState([]);
    const [waterph, setWaterph] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser({
                    email: user.email,
                    uid: user.uid,
                });
            } else {
                setUser({ email: null, uid: null });
            }

            const temperature = JSON.parse(localStorage.getItem("temperature"));
            const waterflow = JSON.parse(localStorage.getItem("waterflow"));
            const waterturb = JSON.parse(localStorage.getItem("waterturb"));
            const waterph = JSON.parse(localStorage.getItem("waterph"));

            if (temperature && waterflow && waterturb && waterph) {
              setTemperature(temperature);
              setWaterflow(waterflow);
              setWaterturb(waterturb);
              setWaterph(waterph);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signUp = async(email, password) => {
        await createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                setUser(userCredential.user);
                router.push("/temperature")
            })
            .catch((error) => alert(error.message))
    }

    const signIn = async(email, password) => {
        await signInWithEmailAndPassword(auth, email, password)
			.then((userCredential) => {
				setUser(userCredential.user);
				router.push("/temperature");
			})
			.catch((error) => {(error.code === "auth/wrong-password" ? alert("Wrong Password") : alert(error.code))})
    }

    const logOut = async() => {
        setUser({ email: null, uid: null })
        await signOut(auth)
            .then(router.push("/"))
            .catch((error) => alert(error.message))
    }

    const handleForm = async(val) => {
        localStorage.setItem("temperature", JSON.stringify(val.temperature));
        localStorage.setItem("waterflow", JSON.stringify(val.waterflow));
        localStorage.setItem("waterturb", JSON.stringify(val.waterturb));
        localStorage.setItem("waterph", JSON.stringify(val.waterph));

        router.push("/temperature")
    }

    return (
        <AuthContext.Provider value={{ user, signUp, signIn, logOut, temperature, waterflow, waterturb, waterph, handleForm }}>
            {loading ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
};