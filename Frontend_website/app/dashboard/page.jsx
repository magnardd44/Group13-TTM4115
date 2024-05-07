"use client";

// ChartJS.register(ArcElement, Tooltip, Legend);
import { Bar } from "react-chartjs-2";

import { Chart as ChartJS } from "chart.js/auto";
import { Chart } from "react-chartjs-2";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/utils";
import Loader from "../../components/Loader";

import { getUser } from "../utils";

function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [chargingTimes, setChargingTimes] = useState([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const user = await getUser();

        console.log(user);
        const { data: carResponse, error: carFetchError } = await supabase
          .from("cars")
          .select("*")
          .eq("user_id", user.id);

        console.log(carResponse);

        const { data: invoiceResponse, error: invoiceFetchError } =
          await supabase
            .from("invoices")
            .select("*")
            .eq("car_id", carResponse[0].car_id)
            .order("created_at", { ascending: false })
            .limit(7);

        console.log(invoiceResponse);

        let chargingTimeResults = calculateTimeCharged(invoiceResponse);

        if (chargingTimeResults && invoiceResponse) {
          setChargingTimes(chargingTimeResults);
          setInvoices(invoiceResponse);
        }
        setIsLoading(false);
      } catch (error) {
        throw new Error(error);
      }
    };

    fetchInvoices();
  }, []);

  const calculateTimeCharged = (data) => {
    let times = data.map((currentValue) => {
      let chargingTimeInMinutes = currentValue.percentage_charged * 2;

      return chargingTimeInMinutes;
    });

    return times;
  };

  if (isLoading) return <Loader />;

  const BarChart = () => {
    const labels = invoices.map((invoice, index) => {
      let timeInterval = calculateTimeInterval(invoice.created_at, index);

      return timeInterval;
    });

    const data = {
      labels: labels.reverse(),
      datasets: [
        {
          label: "Number of Minutes Charged",
          data: chargingTimes,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
            "rgba(199, 199, 199, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(199, 199, 199, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };

    const options = {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: true,
        },
      },
    };

    return <Bar data={data} options={options} />;
  };

  function addMinutesToDate(date, minutes) {
    var newDate = new Date(date);

    var totalMinutes = newDate.getMinutes() + minutes;

    var hoursToAdd = Math.floor(totalMinutes / 60);

    newDate.setMinutes(totalMinutes % 60);

    newDate.setHours(newDate.getHours() + hoursToAdd);

    return newDate;
  }

  function calculateTimeInterval(date, index) {
    let newDate = new Date(date);

    let startHour = newDate.getHours();
    let startMinute = newDate.getMinutes();

    if (startHour < 10) startHour = "0" + startHour;
    if (startMinute < 10) startMinute = "0" + startMinute;

    let stopDateTime = addMinutesToDate(newDate, chargingTimes[index]);

    let stopHour = stopDateTime.getHours();
    let stopMinute = stopDateTime.getMinutes();

    if (stopHour < 10) stopHour = "0" + stopHour;
    if (stopMinute < 10) stopMinute = "0" + stopMinute;

    let startTime = `${startHour}:${startMinute}`;
    let stopTime = `${stopHour}:${stopMinute}`;

    let currentDuration = `${startTime} - ${stopTime}`;

    return currentDuration;
  }

  const TableCharging = () => {
    const data = invoices.map((invoice, index) => {
      let newDate = new Date(invoice.created_at);

      let timeInterval = calculateTimeInterval(invoice.created_at, index);

      let day = newDate.getDate();
      let month = newDate.getMonth() + 1;

      if (day < 10) day = "0" + day;
      if (month < 10) month = "0" + month;

      let date = `${day}.${month}`;

      let kwh = chargingTimes[index] / 2;
      let price = kwh * 2;

      return {
        id: index + 1,
        date: date,
        timeInterval: timeInterval,
        kwh: Math.round(kwh),
        price: Math.round(price),
      };
    });

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
              <TableCell>{ele.kwh}kwh</TableCell>
              <TableCell className="text-right">{ele.price}kr</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total</TableCell>
            <TableCell>
              {data.reduce((total, currentValue) => {
                return total + currentValue.kwh;
              }, 0)}
              kwh
            </TableCell>
            <TableCell className="text-right">
              {data.reduce((total, currentValue) => {
                return total + currentValue.price;
              }, 0)}
              kr
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );
  };

  return (
    <main className="">
      <div className="z-10 w-full items-center justify-center text-sm flex flex-col gap-10">
        <h2 className="text-2xl lg:text-3xl mt-4">Dashboard</h2>
        <div className="w-10/12 aspect-[2/1] max-w-[500px]">
          <BarChart />
        </div>
        <div className="w-10/12 max-w-[500px] flex justify-center items-center flex-col gap-6">
          <h2 className="text-xl">History this week</h2>
          <TableCharging />
        </div>

        <div className="w-10/12 max-w-[500px] flex justify-center items-center flex-col gap-6 mb-20">
          <h2 className="text-xl">Previous invoices</h2>
          <TableInvoices />
        </div>
      </div>
    </main>
  );
}

const TableInvoices = () => {
  const data = [
    { id: 0, month: "Jan", kwh: "23kwh", price: 270, hasPaid: false },
    { id: 1, month: "Feb", kwh: "23kwh", price: 300, hasPaid: true },
    { id: 2, month: "Mar", kwh: "23kwh", price: 250, hasPaid: true },
    { id: 3, month: "Apr", kwh: "23kwh", price: 265, hasPaid: true },
  ];
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
            <TableCell>{ele.price}kr</TableCell>
            <TableCell className="flex justify-end">
              {ele.hasPaid ? (
                <p className="bg-green-200 rounded-xl text-center w-full md:w-1/2">
                  Paid
                </p>
              ) : (
                <p className="bg-red-200 rounded-xl text-center w-full md:w-8/12">
                  Not paid
                </p>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">
            {" "}
            {data.reduce((total, currentValue) => {
              return total + currentValue.price;
            }, 0)}
            kr
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export default Dashboard;
