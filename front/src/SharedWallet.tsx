import * as React from "react";
import http from "./httpService";
import { toast } from "react-toastify";

export interface IRecord {
  id: number;
  webAddress?: string;
  description?: string;
  login?: string;
}

interface ISharedRecord {
  id: number;
  password: string;
  isActive: boolean;
  coOwnerId: number;
  wallletRecord: IRecord;
}

export interface IPassword {
  id: string;
  password: string;
}

interface ISharedWallet {
  login?: string | null;
  masterPassword?: string | null;
  setIsPasswordModalOpen: React.Dispatch<React.SetStateAction<number>>;
  setLocation: (
    to: string,
    options?:
      | {
          replace?: boolean | undefined;
        }
      | undefined
  ) => void;
  dispatch: any;
}
export const SharedWallet: React.FC<ISharedWallet> = ({
  login,
  masterPassword,
  setIsPasswordModalOpen,
  setLocation,
  dispatch,
}) => {
  const [password, setPassword] = React.useState<IPassword | null>(null);
  const [records, setRecords] = React.useState<IRecord[]>([]);

  React.useEffect(() => {
    if (!login) {
      toast("You have to sign in", {
        type: "info",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        progress: undefined,
        theme: "light",
      });
      setLocation("/signin");
    } else {
      http
        .get("/wallet/shared")
        .then((resp) => {
          const records: ISharedRecord[] = resp.data;
          setRecords(
            records.map((rec) => {
              return { ...rec.wallletRecord, id: rec.id };
            })
          );
        })
        .catch((err) => {
          if (err.response.status === 401) {
            toast("You've been logged out", {
              type: "info",
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              progress: undefined,
              theme: "light",
            });
            dispatch({ type: "logout" });
            setLocation("/signin");
          } else {
            toast("Error occured. Try again later.", {
              type: "error",
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              progress: undefined,
              theme: "light",
            });
          }
        });
    }
  }, []);
  const hidePassword = () => {
    setPassword(null);
  };

  const copyHandler = async () => {
    await navigator.clipboard.writeText(password!.password);
  };

  const showPassword = (id: number) => {
    if (!masterPassword) {
      setIsPasswordModalOpen(id);
      return;
    }
    http
      .post(`/wallet/shared/${id}`, {
        password: masterPassword,
      })
      .then((resp) => {
        console.log(resp);
        const passwordRecord: IPassword = resp.data;
        setPassword(passwordRecord);
      })
      .catch((err) => {
        if (err.response.status === 401) {
          toast("You have to confirm your master password.", {
            type: "info",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            progress: undefined,
            theme: "light",
          });
          setIsPasswordModalOpen(id);
        } else {
          toast("Error occured. Try again later.", {
            type: "error",
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            progress: undefined,
            theme: "light",
          });
        }
      });
  };
  return (
    <>
      <ul className="shared-list">
        <li>
          <div>Web address</div>
          <div>Login</div>
          <div>Description</div>
          <div>Password</div>
        </li>
      </ul>
      <ul className="shared-list">
        {records.map((record) => (
          <li key={record?.id}>
            <div>{record?.webAddress}</div>
            <div>{record?.login}</div>
            <div>{record?.description}</div>
            <div>
              {password && password.id === record.id.toString() ? (
                <label>
                  <input disabled type="text" value={password.password} />
                  <button onClick={copyHandler}>Copy</button>
                  <button onClick={hidePassword}>Hide</button>
                </label>
              ) : (
                <button onClick={() => showPassword(record.id)}>
                  Show password
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};
