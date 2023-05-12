import db from "@/config/firebase";
import {ref, onValue} from "firebase/database"
import ProtectedRoute from "@/components/Protected";
import Layout from "@/components/Layout";

import { useEffect, useState } from "react";
import { useAuthContext } from '@/config/Context';
import { useRouter } from "next/router";

import { Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Legend, Tooltip } from 'chart.js';
import { Alert } from "@material-tailwind/react";

import moment from "moment";

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Legend, Tooltip);

const Flow = () => {

    const { user, waterflow } = useAuthContext();
    const router = useRouter();

    //SESSION
    useEffect(() => {
        if (user == null) router.push("/session")
    }, [user]) //SESSION

    const [date, setDate] = useState([])
    const [flow, setFlow] = useState([])
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        const dbRef = ref(db, 'Water Quality');
    
        onValue(dbRef, async(snapshot)=>{
            const data = await snapshot.val()
            console.log(data)

            let dataDate = []
            let dataFlow = []

            snapshot.forEach(data => {
                const dataVal = data.val();
                dataDate.push(moment.unix(dataVal.epoch).format('MM-DD-YY h:mm A'))
                dataFlow.push(dataVal.Flow)
            })
            console.log(dataDate)
            while(dataDate.length > 20) {
                dataDate.shift()
                dataFlow.shift()
            }

            setDate(dataDate)
            setFlow(dataFlow)
        })

    }, [])

    useEffect(() => {
        console.log(date)
    }, [date])

    useEffect(() => {
        if (flow.length > 0 && flow[flow.length - 1] > waterflow) {
            setAlert(
                <Alert color="red">
                    <div className="flex-1">
                        <span className="text-xl font-bold block text-red-700">Water Flow Alert!</span>
                        <p className="text-sm truncate">The water flow has exceeded {waterflow} L/HOUR.</p>
                    </div>
                </Alert>
            );
        } else {
            setAlert(null);
        }
    }, [flow]);

    const flowData = {
        labels: date ? [...date] : null,
        datasets: [
            {
                label: 'Temperature',
                data: flow ? [...flow] : null,
                borderColor: ['#eb596e'],
                backgroundColor : ['#ff577f45'],
                pointBackgroundColor: '#ec4646',
                pointBorderColor: '#ec4646'
            },
        ]
    }

    const options = {
        scales: {
            xAxes: [{
                ticks: {
                    fontSize: 8
                }
            }],
            yAxes: [{
                tickes: {
                    fontSize: 10,
                    min: 0,
                    max: 100
                }
            }]
        }
    }

    return(
        <ProtectedRoute>
            <Layout>
            <div className="flex w-full flex-col gap-2">
                    {alert}
            </div>
            <div>
                <Line data={flowData} options={options}/>
            </div>
            </Layout>
        </ProtectedRoute>
    )
}

export default Flow;