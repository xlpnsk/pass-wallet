import * as React from "react";
import http from "./httpService";
import { toast } from "react-toastify";

interface ILastLoginRecordsData {
  sucessfull: any;
  unsucessfull: any;
}

export const LastLogins: React.FC = () => {
  const [lastLoginRecords, setLastLoginRecords] =
    React.useState<ILastLoginRecordsData>({
      sucessfull: null,
      unsucessfull: null,
    });

  React.useEffect(() => {
    Promise.all(
      ["/login-record/successful", "/login-record/unsuccessful"].map(
        (endpoint) => http.get(endpoint)
      )
    )
      .then((resp) => {
        console.log(resp);
        setLastLoginRecords({
          sucessfull: resp.at(0)?.data.at(0),
          unsucessfull: resp.at(1)?.data.at(0),
        });
      })
      .catch((err) => {
        toast(
          "Error occured while fetching last login data. Try again later.",
          {
            type: "error",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            progress: undefined,
            theme: "light",
          }
        );
      });
  }, []);

  return (
    <div>
      <h2>Last logins</h2>
      {lastLoginRecords.sucessfull && (
        <p>
          <strong>Successful: </strong>
          {new Intl.DateTimeFormat("en-US", {
            dateStyle: "full",
            timeStyle: "medium",
            timeZone: "Europe/Warsaw",
          }).format(new Date(lastLoginRecords.sucessfull.loginTime))}
        </p>
      )}
      {lastLoginRecords.unsucessfull && (
        <p>
          <strong>Unsuccessful: </strong>
          {new Intl.DateTimeFormat("en-US", {
            dateStyle: "full",
            timeStyle: "medium",
            timeZone: "Europe/Warsaw",
          }).format(new Date(lastLoginRecords.unsucessfull.loginTime))}
        </p>
      )}
    </div>
  );
};
