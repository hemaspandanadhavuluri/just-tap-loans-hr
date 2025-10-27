import React from "react";
import "./Dashboard.css";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { useRecruitment } from "./RecruitmentContext";
import { useActivity } from "./ActivityContext";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

function Dashboard() {
  const { jobPostings, applications, interviews, offers, candidates } = useRecruitment();
  const { activities: mainActivities, addActivity } = useActivity();
  const pieData = {
    labels: ["Finance", "Marketing & Sales", "Technical", "HR"],
    datasets: [
      {
        data: [40, 30, 20, 10],
        backgroundColor: ["#2563eb", "#22c55e", "#facc15", "#f97316"],
        hoverOffset: 8,
      },
    ],
  };

  const lineData = {
    labels: ["Jan", "Mar", "May", "Jul", "Sep", "Nov"],
    datasets: [
      {
        label: "Employees",
        data: [120, 150, 190, 160, 210, 220],
        borderColor: "#2563eb",
        backgroundColor: "#93c5fd",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const employeeStats = [
    { label: "In Time", value: 60, color: "#22c55e" },
    { label: "Late", value: 30, color: "#facc15" },
    { label: "Absent", value: 5, color: "#ef4444" },
    { label: "On Vacation", value: 5, color: "#03eaffff" },
  ];

  const birthdays = ["Devasena", "Mahesh Babu", "Nani", "Vijaya Laxmi", "Bahubali"];

  return (
    <div className="dashboard-container">
      {/* Attendance + Birthdays */}
      <div className="top-section">
        <div className="attendance-card card">
          <div className="attendance-header">
            <div>
              <h3>236 Employees</h3>
            </div>
            <div className="attendance-rate">
              <p>Attendance rate</p>
              <h2>94.2%</h2>
            </div>
          </div>

          <div className="attendance-bars">
            {employeeStats.map((item) => (
              <div key={item.label} className="bar-row">
                <span>{item.label}</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${item.value}%`, background: item.color }}
                  ></div>
                </div>
                <span className="bar-value">{item.value}</span>
              </div>
            ))}
          </div>

          <button className="view-btn">View</button>
        </div>

        <div className="birthdays-card card">
          <h4>Employee Birthdays & Achievements</h4>
          <p className="month">October 2025</p>
          <ul>
            {birthdays.map((name) => (
              <li key={name}>
                <div className="avatar">{name.charAt(0)}</div>
                <div className="birthday-info">
                  <p>{name}</p>
                  <small>1st Oct</small>
                </div>
                <span className="mail-icon">✉️</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-card gold">
          <h2>247</h2>
          <p>Total Employees</p>
          <small>+12 this month</small>
        </div>
        <div className="stat-card green">
          <h2>87%</h2>
          <p>Employee Satisfaction</p>
          <small>based on latest survey</small>
        </div>
        <div className="stat-card blue">
          <h2>{jobPostings.filter(job => job.status === "Active").length}</h2>
          <p>Open Positions</p>
          <small>{jobPostings.filter(job => job.status === "Active" && job.priority === "Urgent").length} urgent</small>
        </div>
        <div className="stat-card purple">
          <h2>{applications.length}</h2>
          <p>Pending Applications</p>
          <small>applied for new positions</small>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-section">
        <div className="chart-card card">
          <h4>4 Departments</h4>
          <div className="chart-container">
            <Pie
              data={pieData}
              options={{
                responsive: true,
                plugins: { legend: { position: "bottom" } },
              }}
            />
          </div>
        </div>

        <div className="chart-card card">
          <h4>Employee Turnover</h4>
          <div className="chart-container">
            <Line
              data={lineData}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: false } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="activities card">
        <h4>Recent Activities</h4>
        <ul>
          {mainActivities.slice(0, 5).map((a, i) => (
            <li key={a.id || i}>
              <div className="activity-icon">✔️</div>
              <div>
                <p>{a.title}</p>
                <small>{a.time}</small>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
