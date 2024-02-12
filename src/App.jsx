import { useEffect, useState, useRef } from "react";

class LocalStorageManager {
  _storage;
  constructor() {
    this._storage = window.localStorage;
  }
  get(key) {
    const value = this._storage.getItem(key);
    return typeof value === "string" ? JSON.parse(value) : null;
  }
  set(key, value) {
    this._storage.setItem(key, JSON.stringify(value));
  }
}

function usePersistor(key, initialData, driver) {
  const [storedData, setStoredData] = useState(initialData);
  const _channel = useRef(new BroadcastChannel(key)).current;

  const _readValue = () => {
    const value = driver.get(key);
    return value ?? initialData;
  };

  const setValue = (data) => {
    driver.set(key, data);
    setStoredData(data);
    _channel.postMessage(data);
  };

  useEffect(() => {
    const value = _readValue();
    setStoredData(value);
  }, []);

  useEffect(() => {
    function _listener({ data }) {
      setStoredData(data);
    }

    _channel.addEventListener("message", _listener);
    return () => {
      _channel.removeEventListener("message", _listener);
    };
  }, []);

  return [storedData, setValue];
}

export default function App() {
  const driver = useRef(new LocalStorageManager()).current;
  const [count, setCount] = usePersistor("counter", 0, driver);
  const [name, setName] = usePersistor("name", "", driver);

  return (
    <section>
      <button onClick={() => setCount(count + 1)}>count is {count}</button>
      <br />
      <br />
      <input
        type="text"
        value={name}
        onChange={(evt) => setName(evt.target.value)}
      />
    </section>
  );
}
