import { useEffect, useState } from "react";

class LocalStorageManager {
  storage;
  constructor() {
    this.storage = window.localStorage;
  }

  get(key) {
    const value = this.storage.getItem(key);
    return JSON.parse(value);
  }

  set(key, value) {
    this.storage.setItem(key, JSON.stringify(value));
  }
}

function usePersistor(key, initialData, driver) {
  const [storedData, setStoredData] = useState(initialData);
  const [channel] = useState(() => new BroadcastChannel(key));

  const _readValue = () => {
    try {
      const value = driver.get(key);
      return value ?? initialData;
    } catch (error) {
      return initialData;
    }
  };

  const setValue = (data) => {
    try {
      const value = driver.get(key);
      if (JSON.stringify(value) !== JSON.stringify(data)) {
        driver.set(key, data);
        setStoredData(data);
        channel.postMessage(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const value = _readValue();
    setStoredData(value);
  }, []);

  useEffect(() => {
    function listener({ data }) {
      setValue(data);
    }

    channel.addEventListener("message", listener);
    return () => {
      channel.removeEventListener("message", listener);
    };
  }, []);

  return [storedData, setValue];
}

function App() {
  const [driver] = useState(() => new LocalStorageManager());
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

export default App;
