import * as React from "react";
import { toast } from "react-toastify";
import { useLocation } from "wouter";
import { UserContext } from "./App";
import http from "./httpService";
import { PasswordModal } from "./PasswordModal";
import { UpdateRecordModal } from "./UpdateRecordModal";
import "./wallet.css";

export interface IRecord {
  id: number;
  webAddress?: string;
  description?: string;
  login?: string;
}

export interface IPassword {
  id: number;
  password: string;
}

export const Wallet = () => {
  const [records, setRecords] = React.useState<IRecord[]>([]);
  const [editedRecord, setEditedRecord] = React.useState<number | null>(null);
  const [password, setPassword] = React.useState<IPassword | null>(null);
  const {
    login,
    password: masterPassword,
    dispatch,
  } = React.useContext(UserContext);
  const [location, setLocation] = useLocation();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(0);

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
        .get("/wallet")
        .then((resp) => {
          const records: IRecord[] = resp.data;
          setRecords(records);
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

  const showPassword = (id: number) => {
    if (!masterPassword) {
      setIsPasswordModalOpen(id);
      return;
    }
    http
      .post(`/wallet/${id}`, {
        password: masterPassword,
      })
      .then((resp) => {
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

  function closePasswordModalModal() {
    setIsPasswordModalOpen(0);
  }
  function closePasswordModalModalWithSuccess(extraParams?: { id: number }) {
    setIsPasswordModalOpen(0);
    showPassword(extraParams!.id);
  }
  function closePasswordModalModalWithError() {
    toast("Wrong master password. You have to sign in again", {
      type: "error",
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      progress: undefined,
      theme: "light",
    });
    dispatch({ type: "logout" });
    setLocation("/signin");
  }

  const hidePassword = () => {
    setPassword(null);
  };

  const copyHandler = async () => {
    await navigator.clipboard.writeText(password!.password);
  };

  function openModal(id: number) {
    setEditedRecord(id);
  }

  function closeModal() {
    setEditedRecord(null);
  }

  const updateRecord = (id: number, data: IRecord) => {
    setRecords(records.map((record) => (record.id === id ? data : record)));
  };

  const deleteRecord = (id: number) => {
    http
      .delete(`/wallet/${id}`)
      .then((resp) => {
        setRecords(records.filter((record) => record.id !== id));
        toast("Entity deleted", {
          type: "success",
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          progress: undefined,
          theme: "light",
        });
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
      <h2>Hello, {login}</h2>
      <div className="new-record">
        <button onClick={() => setLocation("/new")}>Add new</button>
      </div>
      <ul className="list">
        <li>
          <div>Web address</div>
          <div>Login</div>
          <div>Description</div>
          <div>Password</div>
          <div></div>
          <div></div>
        </li>
      </ul>
      <ul className="list">
        {records.map((record) => (
          <li key={record.id}>
            <div>{record.webAddress}</div>
            <div>{record.login}</div>
            <div>{record.description}</div>
            <div>
              {password && password.id === record.id ? (
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
            <div>
              <button onClick={() => openModal(record.id)}>Edit</button>
            </div>
            <div>
              <button onClick={() => deleteRecord(record.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      <UpdateRecordModal
        isOpen={!!editedRecord}
        onRequestClose={closeModal}
        contentLabel="Update Modal"
        updateRecord={updateRecord}
        recordData={
          editedRecord
            ? records.filter((record) => record.id === editedRecord)[0]
            : null
        }
      />
      <PasswordModal
        isOpen={!!isPasswordModalOpen}
        onRequestClose={closePasswordModalModal}
        onRequestCloseWithSuccess={closePasswordModalModalWithSuccess}
        onRequestCloseWithError={closePasswordModalModalWithError}
        extraParams={{ id: isPasswordModalOpen }}
      />
    </>
  );
};
