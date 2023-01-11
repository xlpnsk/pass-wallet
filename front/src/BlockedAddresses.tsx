import * as React from "react";
import http from "./httpService";
import { toast } from "react-toastify";

interface IPRecord {
  id: number;
  ipAddress: string;
  blockedUntil: string;
  isBlockedPermanently: boolean;
}

export const BlockedAddresses: React.FC = () => {
  const [addresses, setAddresses] = React.useState<IPRecord[]>([]);
  React.useEffect(() => {
    http
      .get("/ip-record/blocked")
      .then((res) => setAddresses(res.data))
      .catch((err) => {
        toast("Error occured. Try again later.", {
          type: "error",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          progress: undefined,
          theme: "light",
        });
      });
  }, []);

  const unblockAddress = (id: number) => {
    http
      .put(`/ip-record/unblock/${id}`)
      .then((res) => {
        console.log(res);
        setAddresses((addr) => addr.filter((a) => a.id !== res.data.id));
        toast("The IP address has been unblocked.", {
          type: "success",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          progress: undefined,
          theme: "light",
        });
      })
      .catch((err) => {
        toast("Error occured. Try again later.", {
          type: "error",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          progress: undefined,
          theme: "light",
        });
      });
  };
  return (
    <div>
      <h2>Blocked IP addresses</h2>
      <ul className="ip-list">
        {addresses.map((address) => (
          <li key={address.id}>
            {address.ipAddress}{" "}
            <button onClick={() => unblockAddress(address.id)}>Unblock</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
