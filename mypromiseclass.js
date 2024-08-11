class SimplePromise {
  constructor(executor) {
    // Initial state is "pending", and value is initially null
    this.state = "pending";
    this.value = null;
    // Handlers array will store callbacks to be executed when the promise resolves or rejects
    this.handlers = [];

    // The resolve function changes the state to "fulfilled" and assigns the resolved value
    const resolve = (value) => {
      if (this.state === "pending") {
        this.state = "fulfilled";
        this.value = value;
        // Execute all the stored onFulfilled handlers
        this.handlers.forEach((handler) => handler.onFulfilled(value));
      }
    };

    // The reject function changes the state to "rejected" and assigns the rejection reason
    const reject = (reason) => {
      if (this.state === "pending") {
        this.state = "rejected";
        this.value = reason;
        // Execute all the stored onRejected handlers
        this.handlers.forEach((handler) => handler.onRejected(reason));
      }
    };

    // The executor is the function passed in when a new SimplePromise is created
    executor(resolve, reject);
  }

  // The then method allows chaining and handling fulfilled or rejected states
  then(onFulfilled, onRejected) {
    // Return a new SimplePromise for chaining
    return new SimplePromise((resolve, reject) => {
      // This function handles both fulfillment and rejection
      const handleCallback = () => {
        try {
          // If the promise was fulfilled, call onFulfilled with the value
          // If onFulfilled is not provided, simply pass through the value
          if (this.state === "fulfilled") {
            resolve(onFulfilled ? onFulfilled(this.value) : this.value);
          }
          // If the promise was rejected, call onRejected with the reason
          // If onRejected is not provided, simply pass through the reason
          else if (this.state === "rejected") {
            reject(onRejected ? onRejected(this.value) : this.value);
          }
        } catch (error) {
          // If there's an error in the callback, reject the promise with the error
          reject(error);
        }
      };

      // If the promise is still pending, store the callbacks to be executed later
      if (this.state === "pending") {
        this.handlers.push({
          onFulfilled: handleCallback,
          onRejected: handleCallback,
        });
      }
      // If the promise has already been resolved or rejected, execute the callback asynchronously
      else {
        setTimeout(handleCallback, 0);
      }
    });
  }
  catch(onRejected) {
    return this.then(null, onRejected);
  }
}

//assignment code
// promsified set timeout
function promiseTimeout(ms) {
  return new SimplePromise((resolve) => {
    setTimeout(() => {
      resolve(`Waited for ${ms} milliseconds`);
    }, ms);
  });
}

promiseTimeout(1000).then((message) => {
  console.log(message); // Logs "Waited for 1000 milliseconds" after 1 second
});
// 2. Promisified fetch()

function promiseFetch(url) {
  return new SimplePromise((resolve, reject) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
}

promiseFetch("https://jsonplaceholder.typicode.com/todos/1")
  .then((data) => {
    console.log(data); // Logs the fetched data
  })
  .catch((error) => {
    console.error("Fetch error:", error);
  });
// 3. Promisified fs.readFile()

const fs = require("fs");

function promiseReadFile(filePath) {
  return new SimplePromise((resolve, reject) => {
    fs.readFile("./file.text", "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

promiseReadFile("./file.text")
  .then((data) => {
    console.log("File content:", data); // Logs the content of example.txt
  })
  .catch((error) => {
    console.error("Read file error:", error);
  });
