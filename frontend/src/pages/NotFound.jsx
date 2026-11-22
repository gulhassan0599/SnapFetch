import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/common/Button";
import { FiAlertCircle } from "react-icons/fi";

export const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
      <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-3xl animate-[bounce_2s_infinite]">
        <FiAlertCircle size={36} />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
          Page Not Found
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 max-w-sm">
          The link you requested does not exist or has been relocated to another
          address.
        </p>
      </div>
      <Link to="/">
        <Button className="font-bold">Go Back Home</Button>
      </Link>
    </div>
  );
};

export default NotFound;
