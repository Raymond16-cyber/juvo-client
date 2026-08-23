import React from "react";

const Sidebar = () => {
  return (
    <div className="flex flex-col gap-4 px-2 bg-black w-fit text-sm">
      <h2 className="dark:text-white text-3xl">JUVO</h2>
      <div>
        <p>Dashboard</p>
        <p>Journal</p>
        <p>Juvo Calendar</p>
        <p>Analytics</p>
        <p>Behavioural Insights</p>
        <p>Juvo AI</p>
        <p>Growth</p>
      </div>
      <div>
        <p>Trading Accounts</p>
        <p>Broker Connections</p>
        <p>Export Data</p>
      </div>
      <div>
        <p>Referrals</p>
        <p>Subscriptions</p>
        <p>Settings</p>
        <p>Help Center</p>
      </div>
      <div>
        <div className="user-profile-pic"></div>
        <div className="user-info">
          <p className="user-name">Ballistic Trader</p>
          <p className="user-email">uchennaraymond74@gmail.com</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
