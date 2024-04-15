"use client"

import Image from "next/image";
import { Button } from "@/components/ui/button"
import { Chart as ChartJS } from 'chart.js/auto'
import { Chart }            from 'react-chartjs-2'
// ChartJS.register(ArcElement, Tooltip, Legend);
import { Bar } from 'react-chartjs-2';
import "./page.css"




import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


import { LuLayoutDashboard } from "react-icons/lu";
import { RxHamburgerMenu } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";
import { IoLogInOutline } from "react-icons/io5";

import { buttonVariants } from "@/components/ui/button"
import { navigate } from "../actions";
import { supabase } from "../../utils/supabase/client";



export default function Dashboard() {


  const LogOut = async () => {

    try {
      const {error} = await supabase.auth.signOut();

      if (!error) {
        navigate('#')
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <main className="">    
      <div className="z-10 w-full items-center justify-center text-sm flex flex-col gap-10">

     
        <CurrentlyCharging presentage={43} />

        <h2 className="text-3xl ">Dashboard</h2>
        <div className="w-10/12 max-w-[500px]">
          <BarChart />
        </div>
        <div className="w-10/12 max-w-[500px] flex justify-center items-center flex-col gap-6">
          <h2 className="text-xl">History this month</h2>
          <TableCharging/>
        </div>

        <div className="w-10/12 max-w-[500px] flex justify-center items-center flex-col gap-6 mb-20">
          <h2 className="text-xl">Previous invoices</h2>
          <TableInvoices/>
        </div>
        
      </div>
    </main>
  );
}


const CurrentlyCharging = ({presentage}) => {
  return (
    <>
    {/* <p className="text-xl">Charging...</p> */}
    <div className="battery">
      <div className="flex justify-center items-center flex-col h-full">
        <p className="text-xl relative font-semibold">Charging...</p>
        <p className="relative text-xl">{presentage}%</p>
      </div>
    </div>
    </>
  )
}


const TableCharging = () => {
  const data = [
  {id: 0, date: "January 12", timeInterval: "16:00 - 16:44", kwh: "23kwh", price: 27},
  {id: 1, date: "January 10", timeInterval: "16:00 - 16:44", kwh: "23kwh", price: 37},
  {id: 2, date: "January 9", timeInterval: "16:00 - 16:44", kwh: "23kwh", price: 50 },
  {id: 3, date: "January 5", timeInterval: "16:00 - 16:44", kwh: "23kwh", price: 34 },
  {id: 4, date: "January 2", timeInterval: "16:00 - 16:44", kwh: "23kwh", price: 11 }]
  return (

    <Table>
    {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
    <TableHeader>
      <TableRow>
        <TableHead>Date</TableHead>
        <TableHead>Time</TableHead>
        <TableHead>Amount</TableHead>
        <TableHead className="text-right">Price</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((ele) => (
        <TableRow key={ele.id}>
          <TableCell className="font-medium">{ele.date}</TableCell>
          <TableCell>{ele.timeInterval}</TableCell>
          <TableCell>{ele.kwh}</TableCell>
          <TableCell className="text-right">{ele.price}</TableCell>
        </TableRow>
      ))}
    </TableBody>
    <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">
            {data.reduce((total, currentValue) => {
            return total + currentValue.price
          }, 0)}kr</TableCell>
        </TableRow>
      </TableFooter>
  </Table>

  )
}

const TableInvoices = () => {
  const data = [
  {id: 0, month: "Jan", kwh: "23kwh", price: 27, hasPaid: false},
  {id: 1, month: "Feb", kwh: "23kwh", price: 37, hasPaid: true},
  {id: 2, month: "Mar", kwh: "23kwh", price: 50, hasPaid: true},
  {id: 3, month: "Apr", kwh: "23kwh", price: 34, hasPaid: true},]
  return (

    <Table>
    {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
    <TableHeader>
      <TableRow>
        <TableHead>Month</TableHead>
        <TableHead>Amount</TableHead>
        <TableHead>Price</TableHead>
        <TableHead className="text-right">Paid</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((ele) => (
        <TableRow key={ele.id}>
          <TableCell className="font-medium">{ele.month}</TableCell>
          <TableCell>{ele.kwh}</TableCell>
          <TableCell>{ele.price}</TableCell>
          <TableCell className="flex justify-end">{ele.hasPaid ? <p className="bg-green-200 rounded-xl text-center w-1/2">Paid</p> : <p className="bg-red-200 rounded-xl text-center w-8/12">Not paid</p> }</TableCell>
        </TableRow>
      ))}
    </TableBody>
    <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">  {data.reduce((total, currentValue) => {
            return total + currentValue.price
          }, 0)}kr</TableCell>
        </TableRow>
      </TableFooter>
  </Table>

  )
}



const BarChart = () => {
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'Number of Items Sold',
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(199, 199, 199, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: true
      }
    }
  };

  return <Bar data={data} options={options} />;
}

