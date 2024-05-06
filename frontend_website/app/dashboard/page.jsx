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

function Dashboard() {
  const [invoices, setInvoices] = useState(null);

  const [charingTimes, setCharingTimes] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      const user = await supabase.auth.getUser();

      const { data: carResponse, error: carFetchError } = await supabase
        .from("cars")
        .select("*")
        .eq("user_id", user.data.user.id);

      const { data: invoiceResponse, error: invoiceFetchError } = await supabase
        .from("test")
        .select("*")
        .eq("car_id", carResponse[0].car_id)
        .order("created_at", { ascending: false })
        .limit(7);

      console.log(invoiceResponse);

      if (carFetchError) throw new Error(carFetchError);
      if (invoiceFetchError) throw new Error(invoiceFetchError);

      let charingTimeResults = calculateTimeCharged(invoiceResponse);

      setCharingTimes(charingTimeResults);

      setInvoices(invoiceResponse);
    };

    fetchInvoices();
  }, []);

  const calculateTimeCharged = (data) => {
    let times = data.map((currentValue) => {
      let chargingStarted = new Date(currentValue.created_at);
      let chargingStopped = new Date(currentValue.charging_stopped);

      let difference = Math.abs(chargingStopped - chargingStarted);

      let differenceInSeconds = difference / 1000;

      let differenceInMinutes = differenceInSeconds / 60;

      return differenceInMinutes;
    });

    return times;
  };

  if (!invoices || !charingTimes) return <Loader />;

  const BarChart = () => {
    const data = {
      labels: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      datasets: [
        {
          label: "Number of Minutes Charged",
          data: charingTimes,
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

  const TableCharging = () => {
    const dates = [
      "May 2",
      "May 1",
      "April 30",
      "April 28",
      "April 27",
      "April 25",
      "April 24",
    ];

    const data = invoices.map((invoice, index) => {
      let startTime = new Date(invoice.created_at);

      let stopTime = new Date(invoice.charging_stopped);

      let startHour = startTime.getHours();
      let startMinutes = startTime.getMinutes();

      let stopHour = stopTime.getHours();
      let stopMinutes = stopTime.getMinutes();

      let formattedStartTime =
        (startHour < 10 ? "0" : "") +
        startHour +
        ":" +
        (startMinutes < 10 ? "0" : "") +
        startMinutes;

      let formattedStopTime =
        (stopHour < 10 ? "0" : "") +
        stopHour +
        ":" +
        (stopMinutes < 10 ? "0" : "") +
        stopMinutes;

      let currentDuration = `${formattedStartTime} - ${formattedStopTime}`;

      let difference = Math.abs(stopTime - startTime);

      let differenceInSeconds = difference / 1000;

      let differenceInHours = differenceInSeconds / 3600;

      let kwh = differenceInHours * 15;

      return {
        id: index + 1,
        date: dates[index],
        timeInterval: currentDuration,
        kwh: Math.round(kwh),
        price: Math.round(kwh * 0.8),
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
