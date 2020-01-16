define(['exports'], function (exports) { 'use strict';

    const kIsNodeJS = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';
    const kRequire = kIsNodeJS && typeof module.require === 'function' ? module.require : null; // eslint-disable-line

    function browserDecodeBase64(base64, enableUnicode) {
        const binaryString = atob(base64);
        if (enableUnicode) {
            const binaryView = new Uint8Array(binaryString.length);
            Array.prototype.forEach.call(binaryView, (el, idx, arr) => {
                arr[idx] = binaryString.charCodeAt(idx);
            });
            return String.fromCharCode.apply(null, new Uint16Array(binaryView.buffer));
        }
        return binaryString;
    }

    function nodeDecodeBase64(base64, enableUnicode) {
        return Buffer.from(base64, 'base64').toString(enableUnicode ? 'utf16' : 'utf8');
    }

    function createBase64WorkerFactory(base64, sourcemap = null, enableUnicode = false) {
        const source = kIsNodeJS ? nodeDecodeBase64(base64, enableUnicode) : browserDecodeBase64(base64, enableUnicode);
        const start = source.indexOf('\n', 10) + 1;
        const body = source.substring(start) + (sourcemap ? `\/\/# sourceMappingURL=${sourcemap}` : '');

        if (kRequire) {
            /* node.js */
            const Worker = kRequire('worker_threads').Worker; // eslint-disable-line
            return function WorkerFactory(options) {
                return new Worker(body, Object.assign({}, options, { eval: true }));
            };
        }

        /* browser */
        const blob = new Blob([body], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        return function WorkerFactory(options) {
            return new Worker(url, options);
        };
    }

    /* eslint-disable */
    const WorkerFactory = createBase64WorkerFactory('Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwpjb25zdCBrSXNOb2RlSlMgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnID8gcHJvY2VzcyA6IDApID09PSAnW29iamVjdCBwcm9jZXNzXSc7CmNvbnN0IGtSZXF1aXJlID0ga0lzTm9kZUpTID8gbW9kdWxlLnJlcXVpcmUgOiBudWxsOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lCgpjb25zdCBfc2VsZiA9IGtJc05vZGVKUyA/IGtSZXF1aXJlKCd3b3JrZXJfdGhyZWFkcycpLnBhcmVudFBvcnQgOiBzZWxmOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lCmNvbnN0IF9wZXJmb3JtYW5jZSA9IGtJc05vZGVKUyA/IGtSZXF1aXJlKCdwZXJmX2hvb2tzJykucGVyZm9ybWFuY2UgOiBwZXJmb3JtYW5jZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZQoKbGV0IHdhc20gPSBudWxsOwpsZXQgbWVtb3J5ID0gbnVsbDsKbGV0IHZpZXcgPSBudWxsOwoKbGV0IHJ1bldvcmtsb2FkID0gKCkgPT4gewogICAgdGhyb3cgJ0VSUk9SOiBXb3JrZXIgaGFzIG5vdCBiZWVuIGluaXRpYWxpemVkISc7Cn07CgovKioKICogRnVuY3Rpb24gdG8gcnVuIHRoZSBudW1lcmljIHdvcmtsb2FkIGluIHRoZSBjdXJyZW50IHRocmVhZCBmb3IgdGhlIHNwZWNpZmllZCBhbW91bnQgb2YgdGltZSBpbiBKYXZhU2NyaXB0LgogKiBAcGFyYW0ge251bWJlcn0gZHVyYXRpb24gLSBUaGUgZHVyYXRpb24gb2YgdGhpcyB3b3JrbG9hZCBpbiBtaWxsaXNlY29uZHMKICogQHBhcmFtIHtudW1iZXJ9IGlkIC0gVGhlIGlkIG9mIHRoaXMgdGhyZWFkLgogKiBAcmV0dXJucyB7e2VsYXBzZWQ6IG51bWJlciwgcmVzdWx0OiBudW1iZXIsIGlkOiAqLCBpdGVyYXRpb25zOiBudW1iZXJ9fQogKiBAcHJpdmF0ZQogKi8KZnVuY3Rpb24gcnVuV29ya2xvYWRKUyhkdXJhdGlvbiwgaWQpIHsKICAgIGNvbnN0IHNpbiA9IE1hdGguc2luOwogICAgY29uc3QgY29zID0gTWF0aC5jb3M7CiAgICBjb25zdCBNX1BJID0gTWF0aC5QSTsKCiAgICBsZXQgY3JlYWwgPSAtMC44OwogICAgbGV0IGNpbWFnID0gMC4xNTY7CgogICAgbGV0IGZyYW1lID0gMDsKCiAgICBsZXQgeTsKICAgIGxldCB4OwogICAgbGV0IGk7CiAgICBsZXQgaWk7CgogICAgbGV0IGN4OwogICAgbGV0IGN5OwogICAgbGV0IHh0OwoKICAgIGNvbnN0IHN0YXJ0ID0gX3BlcmZvcm1hbmNlLm5vdygpOwogICAgbGV0IGVuZCA9IHN0YXJ0OwoKICAgIGZvciAoaWkgPSAwOyBlbmQgLSBzdGFydCA8IGR1cmF0aW9uOyArK2lpLCBlbmQgPSBfcGVyZm9ybWFuY2Uubm93KCkpIHsKICAgICAgICBmb3IgKHkgPSAwOyB5IDwgMjAwOyArK3kpIHsKICAgICAgICAgICAgZm9yICh4ID0gMDsgeCA8IDIwMDsgKyt4KSB7CiAgICAgICAgICAgICAgICBjeCA9IC0yICsgeCAvIDUwOwogICAgICAgICAgICAgICAgY3kgPSAtMiArIHkgLyA1MDsKICAgICAgICAgICAgICAgIGkgPSAwOwoKICAgICAgICAgICAgICAgIGRvIHsKICAgICAgICAgICAgICAgICAgICB4dCA9IGN4ICogY3ggLSBjeSAqIGN5ICsgY3JlYWw7CiAgICAgICAgICAgICAgICAgICAgY3kgPSAyICogY3ggKiBjeSArIGNpbWFnOwogICAgICAgICAgICAgICAgICAgIGN4ID0geHQ7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgICAgICB3aGlsZSAoKGN4ICogY3ggKyBjeSAqIGN5IDwgNCkgJiYgKytpIDwgMjUpOwogICAgICAgICAgICB9CiAgICAgICAgfQogICAgICAgICsrZnJhbWU7IC8vIGluY3JlYXNlIHRoZSBudW1iZXIgb2YgdGhlIGZyYW1lCiAgICAgICAgY3JlYWwgPSAtMC44ICsgMC42ICogc2luKGZyYW1lIC8gKE1fUEkgKiAyMCkpOyAvLyBjYWxjdWxhdGUgdGhlIG5ldyBjb29yZGluYXRlcwogICAgICAgIGNpbWFnID0gMC4xNTYgKyAwLjQgKiBjb3MoZnJhbWUgLyAoTV9QSSAqIDQwKSk7IC8vIG9mIHRoZSBjIHBvaW50CiAgICB9CgogICAgcmV0dXJuIHsKICAgICAgICBlbGFwc2VkOiBlbmQgLSBzdGFydCwKICAgICAgICBpdGVyYXRpb25zOiBmcmFtZSwKICAgICAgICByZXN1bHQ6IHh0LAogICAgICAgIGlkLAogICAgfTsKfQoKLyoqCiAqIEZ1bmN0aW9uIHRvIHJ1biB0aGUgbnVtZXJpYyB3b3JrbG9hZCBpbiB0aGUgY3VycmVudCB0aHJlYWQgZm9yIHRoZSBzcGVjaWZpZWQgYW1vdW50IG9mIHRpbWUgaW4gV0FTTS4KICogTm90ZTogdGhlIFdBU00gbW9kdWxlIG11c3QgYmUgcHJlLWxvYWRlZCBieSBzZW5kaW5nIHRoZSBgaW5pdGAgbWVzc2FnZSBmcm9tIHRoZSBtYWluIHRocmVhZC4KICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uIC0gVGhlIGR1cmF0aW9uIG9mIHRoaXMgd29ya2xvYWQgaW4gbWlsbGlzZWNvbmRzCiAqIEBwYXJhbSB7bnVtYmVyfSBpZCAtIFRoZSBpZCBvZiB0aGlzIHRocmVhZC4KICogQHJldHVybnMge3tlbGFwc2VkOiBudW1iZXIsIHJlc3VsdDogbnVtYmVyLCBpZDogKiwgaXRlcmF0aW9uczogbnVtYmVyfX0KICogQHByaXZhdGUKICovCmZ1bmN0aW9uIHJ1bldvcmtsb2FkV0FTTShkdXJhdGlvbiwgaWQpIHsKICAgIHdhc20uZXhwb3J0cy5fcnVuV29ya2xvYWQoZHVyYXRpb24sIDQpOwogICAgcmV0dXJuIHsKICAgICAgICBpdGVyYXRpb25zOiB2aWV3LmdldFVpbnQzMig0LCB0cnVlKSwKICAgICAgICByZXN1bHQ6IHZpZXcuZ2V0VWludDMyKDgsIHRydWUpLAogICAgICAgIGVsYXBzZWQ6IHZpZXcuZ2V0RmxvYXQzMigxMiwgdHJ1ZSksCiAgICAgICAgaWQsCiAgICB9Owp9CgovKioKICogSGFuZGxlcyBldmVudHMgc2VudCB0byB0aGlzIHRocmVhZCwgZnJvbSBvdGhlciB0aHJlYWRzLCB0aHJvdWdoIHRoZSBgc2VsZmAgb2JqZWN0LgogKiBUaGUgbWVzc2FnZXMgY2FuZSBiZToKICogYGluaXRgIC0gdG8gaW5pdGlhbGl6ZSB0aGlzIHRocmVhZCwgdGFrZXMgY2FyZSBvZiBicmllZmx5IHJ1bm5pbmcgdG8gd29ya2xvYWQgdG8gYWxsb3cgQ1BVcyB0byBjYWNoZSB0aGUgY29kZQogKiBgd29ya2xvYWRgIC0gcnVucyB0aGUgd29ya2xvYWQgb24gdGhpcyB0aHJlYWQgZm9yIDEwbXMgYW5kIHJldHVybnMgdGhlIHJlc3VsdHMgdG8gdGhlIGNhbGxpbmcgdGhyZWFkCiAqIEBwYXJhbSB7TWVzc2FnZUV2ZW50fSBlIC0gVGhlIHBvc3RlZCBtZXNzYWdlIGV2ZW50LgogKiBAcHJpdmF0ZQogKi8KKF9zZWxmLm9uIHx8IF9zZWxmLmFkZEV2ZW50TGlzdGVuZXIpLmNhbGwoX3NlbGYsICdtZXNzYWdlJywgZSA9PiB7CiAgICBjb25zdCBtZXNzYWdlID0gZS5kYXRhIHx8IGU7CgogICAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHsKICAgICAgICBjYXNlICdpbml0JzoKICAgICAgICAgICAgaWYgKG1lc3NhZ2Uud2FzbSkgewogICAgICAgICAgICAgICAgY29uc3QgbWVtb3J5U2l6ZSA9IDE2OwogICAgICAgICAgICAgICAgbWVtb3J5ID0gbmV3IFdlYkFzc2VtYmx5Lk1lbW9yeSh7aW5pdGlhbDogbWVtb3J5U2l6ZSwgbWF4aW11bTogbWVtb3J5U2l6ZX0pOwogICAgICAgICAgICAgICAgdmlldyA9IG5ldyBEYXRhVmlldyhtZW1vcnkuYnVmZmVyKTsKICAgICAgICAgICAgICAgIHdhc20gPSBuZXcgV2ViQXNzZW1ibHkuSW5zdGFuY2UobWVzc2FnZS53YXNtLCB7CiAgICAgICAgICAgICAgICAgICAgZW52OiB7CiAgICAgICAgICAgICAgICAgICAgICAgIF9ub3c6IF9wZXJmb3JtYW5jZS5ub3cuYmluZChfcGVyZm9ybWFuY2UpLAogICAgICAgICAgICAgICAgICAgICAgICBtZW1vcnk6IG1lbW9yeSwKICAgICAgICAgICAgICAgICAgICB9LAogICAgICAgICAgICAgICAgfSk7CiAgICAgICAgICAgICAgICBydW5Xb3JrbG9hZCA9IHJ1bldvcmtsb2FkV0FTTTsKICAgICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgICAgIHJ1bldvcmtsb2FkID0gcnVuV29ya2xvYWRKUzsKICAgICAgICAgICAgfQogICAgICAgICAgICBydW5Xb3JrbG9hZCgxLCAwKTsKICAgICAgICAgICAgX3NlbGYucG9zdE1lc3NhZ2UoJ3N1Y2Nlc3MnKTsKICAgICAgICAgICAgYnJlYWs7CgogICAgICAgIGNhc2UgJ3dvcmtsb2FkJzogewogICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHsKICAgICAgICAgICAgICAgIF9zZWxmLnBvc3RNZXNzYWdlKHJ1bldvcmtsb2FkKDI1LCBtZXNzYWdlLmlkKSk7CiAgICAgICAgICAgIH0sIG1lc3NhZ2Uuc3RhcnRUaW1lIC0gRGF0ZS5ub3coKSk7CiAgICAgICAgICAgIGJyZWFrOwogICAgICAgIH0KICAgIH0KfSk7Cgo=', null, false);
    /* eslint-enable */

    var workloadWASM = "data:application/wasm;base64,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";

    const kIsNodeJS$1 = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';
    const kRequire$1 = kIsNodeJS$1 ? module.require : null; // eslint-disable-line

    /**
     * Utility to estimate the number of usable cores to perform data processing in node.js and the browser.
     *
     * In node.js, it uses the code from [this gist](https://gist.github.com/brandon93s/a46fb07b0dd589dc34e987c33d775679) to
     * query the number of CPUs on the system. It can be configured to run the same estimation as in the browser.
     *
     * In the browser, takes ~2 seconds to estimate the number of CPUs, uses WASM (when available) to perform the estimation.
     *
     * Returns a {@link Promise} that resolves to a {@link WebCPUResult}.
     *
     * ### Installation
     * ```
     * yarn add webcpu
     * ```
     * or
     * ```
     * npm install webcpu
     * ```
     *
     * ### Usage
     * In Web:
     * ```
     * import {WebCPU} from 'webcpu';
     *
     * WebCPU.detectCPU().then(result => {
     *     console.log(`Reported Cores: ${result.reportedCores}`);
     *     console.log(`Estimated Idle Cores: ${result.estimatedIdleCores}`);
     *     console.log(`Estimated Physical Cores: ${result.estimatedPhysicalCores}`);
     * });
     * ```
     *
     * In Node:
     * ```
     * const WebCPU = require('webcpu/dist/umd/webcpu').WebCPU;
     *
     * WebCPU.detectCPU().then(result => {
     *     console.log(`Reported Cores: ${result.reportedCores}`);
     *     console.log(`Estimated Idle Cores: ${result.estimatedIdleCores}`);
     *     console.log(`Estimated Physical Cores: ${result.estimatedPhysicalCores}`);
     * });
     * ```
     *
     * ### Description
     * The core estimation is affected by other tasks in the system, usually the OS scheduler is efficient enough that
     * light tasks (playing music, idle programs, background updates, etc) are evenly distributed across cores and so they
     * will not affect the result of this estimation. Heavy tasks do have an effect in the results of the estimation, it is
     * recommended that you avoid performing heavy tasks while the estimation is running, it is considered good practice to
     * run the estimation periodically to compensate for user's CPU workloads and always keep an optimal number of
     * operational cores.
     *
     * The estimation is performed by running a mathematical operation in a loop for a predefined amount of time. Modern
     * CPUs run this task simultaneously across physical cores and usually each core completes a very similar number of
     * operations, once hyper threading (or task scheduling) kicks in, a few cores must share their cycles among
     * threads running. By detecting the changes in operations completed by each thread, it is possible to estimate the
     * number of cores in the system.
     *
     * The current algorithm returns bad estimations for CPUs with asymmetric cores (usually mobile ARM chips) because, as
     * explained above, it detects the changes in number of operations between threads. Asymmetric cores will complete
     * a different number of operations depending on the power of the core the task is scheduled on. Although the returned
     * estimations will be incorrect, they are safe to use to spawn threads.
     *
     * This utility DOES NOT estimate logical cores, instead it uses `navigator.hardwareConcurrency` (if available) or simply
     * returns the same number as the estimated physical cores.
     *
     * ## Methods
     */
    class WebCPU {
        /**
         * Estimates the number of CPUs in this machine.
         * @param {boolean=} hardcore - Engages hardcore mode, which kills all the workers after every test.
         * @param {boolean=} estimateInNode - If `true`, forces core estimation in Node.js rather than querying the system.
         * @returns {Promise<WebCPUResult>} - Result of the estimation.
         */
        static async detectCPU(hardcore = false, estimateInNode = false) {
            let reportedCores;

            if (kIsNodeJS$1) {
                /* we are running in node, emulate the response */
                /* eslint-disable */
                const os = kRequire$1('os');
                const childProcess = kRequire$1('child_process');

                reportedCores = kRequire$1('os').cpus().length;

                if (!estimateInNode) {
                    /* code taken from https://gist.github.com/brandon93s/a46fb07b0dd589dc34e987c33d775679 */
                    const exec = function exec(command) {
                        return childProcess.execSync(command, {encoding: 'utf8'});
                    };

                    const platform = os.platform();
                    let amount = 0;

                    if (platform === 'linux') {
                        const output = exec('lscpu -p | egrep -v "^#" | sort -u -t, -k 2,4 | wc -l');
                        amount = parseInt(output.trim(), 10);
                    } else if (platform === 'darwin') {
                        const output = exec('sysctl -n hw.physicalcpu_max');
                        amount = parseInt(output.trim(), 10);
                    } else if (platform === 'windows') {
                        const output = exec('WMIC CPU Get NumberOfCores');
                        amount = output.split(os.EOL)
                            .map(function parse(line) {
                                return parseInt(line)
                            })
                            .filter(function numbers(value) {
                                return !isNaN(value)
                            })
                            .reduce(function add(sum, number) {
                                return sum + number
                            }, 0);
                    }

                    if (amount) {
                        return {
                            reportedCores: reportedCores,
                            estimatedIdleCores: amount,
                            estimatedPhysicalCores: amount,
                        }
                    }
                }
                /* eslint-enable */
            } else {
                reportedCores = navigator.hardwareConcurrency ? navigator.hardwareConcurrency : null;
            }

            const maxCoresToTest = reportedCores ? reportedCores : Number.MAX_SAFE_INTEGER;
            const workers = [];
            const loops = 2;
            let baseStats;

            let wasmModule = null;
            if (WebAssembly) {
                if (WebAssembly.compileStreaming) {
                    wasmModule = await WebAssembly.compileStreaming(fetch(workloadWASM));
                } else if (WebAssembly.compile) {
                    if (kIsNodeJS$1) {
                        const buffer = Buffer.from(workloadWASM.substr(workloadWASM.indexOf(',') + 1), 'base64');
                        wasmModule = await WebAssembly.compile(buffer);
                    } else {
                        const result = await fetch(workloadWASM);
                        const buffer = await result.arrayBuffer();
                        wasmModule = await WebAssembly.compile(buffer);
                    }
                }
            }

            workers.push(await this._initWorker(wasmModule));
            await this._testWorkers(workers, loops);
            baseStats = await this._testWorkers(workers, loops);
            // console.log(baseStats);

            if (hardcore) {
                this._killWorkers(workers);
            }

            let oddCores = 0;
            let thresholdCount = 0;
            let threadCount = 0;
            while (threadCount < maxCoresToTest) {
                ++threadCount;
                const promises = [];
                for (let i = workers.length; i < threadCount; ++i) {
                    promises.push(this._initWorker(wasmModule).then(worker => workers.push(worker)));
                }
                await Promise.all(promises);
                promises.length = 0;

                const stats = await this._testWorkers(workers, loops);
                if (!this._areAllCoresValid(baseStats, stats, 0.9)) {
                    --threadCount;
                    ++thresholdCount;
                    if (thresholdCount > 3) {
                        if (threadCount % 2 && ++oddCores < 2) {
                            --threadCount;
                            thresholdCount = 0;
                            this._killWorkers([workers.pop()]);
                        } else {
                            this._killWorkers(workers);
                            break;
                        }
                    }
                } else if (thresholdCount) {
                    --threadCount;
                    --thresholdCount;
                }

                if (hardcore) {
                    this._killWorkers(workers);
                }
            }

            let physicalCores;
            if (reportedCores && threadCount < reportedCores) {
                physicalCores = Math.floor(reportedCores / 2);
            } else {
                physicalCores = threadCount;
            }

            return {
                reportedCores: reportedCores,
                estimatedIdleCores: threadCount,
                estimatedPhysicalCores: physicalCores,
            };
        }

        /**
         * Kills all the workers in the specified array.
         * @param {Worker[]} workers - Workers to kill
         * @private
         */
        static _killWorkers(workers) {
            while (workers.length) {
                workers.pop().terminate();
            }
        }

        /**
         * Run tests in the specified workers and repeats the test for the specified number of loops. This function performs
         * and ignores the results of 5 extra loops. This is to mitigate the fact that some processor and OS combinations
         * use lazy loading.
         * @param {Worker[]} workers - The workers in which the test will run.
         * @param {number} loops - The number of times the tests will be repeated.
         * @returns {Promise<Array>}
         * @private
         */
        static async _testWorkers(workers, loops) {
            const stats = [];
            const promises = [];
            const extraLoops = 2;
            const startTime = Date.now() + workers.length * 3;
            let results;
            for (let n = 0; n < loops + extraLoops; ++n) {
                for (let i = 0; i < workers.length; ++i) {
                    promises.push(this._computeWorker(workers[i], i, startTime));
                }
                results = await Promise.all(promises);
                if (n >= extraLoops) {
                    this._addResults(stats, results);
                }
                promises.length = 0;
            }

            this._aggregateResults(stats, loops);

            return stats;
        }

        /**
         * Adds the results from a test loop to the specified stats array.
         * @param {Array} stats - Stats array to save the results in
         * @param {Array} results - The results of a test loop.
         * @private
         */
        static _addResults(stats, results) {
            for (let i = 0; i < results.length; ++i) {
                if (!stats[results[i].id]) {
                    stats[results[i].id] = {
                        elapsed: 0,
                        iterations: 0,
                    };
                }
                stats[results[i].id].elapsed += results[i].elapsed;
                stats[results[i].id].iterations += results[i].iterations;
            }
        }

        /**
         * Aggregates all the results added to a stats object.
         * This function effectively normalizes the data passed to it.
         * @param {Array} stats - Stats array no aggregate.
         * @param {number} loops - The number of times the test ran.
         * @returns {Array}
         * @private
         */
        static _aggregateResults(stats, loops) {
            for (let i = 0; i < stats.length; ++i) {
                stats[i].elapsed /= loops;
                stats[i].iterations /= loops;
            }

            return stats;
        }

        /**
         * Starts the computation task in the specified worker with the specified id.
         * This method also accepts a start time (in ms, usually Date.now() + ms_to delay), useful to synchronize the start
         * time of the computation in multiple threads.
         * @param {Worker} worker - The worker in which the computation will be started.
         * @param {number} id - The id of this thread.
         * @param {number} startTime - A time in the future when the computations should start.
         * @returns {Promise<any>}
         * @private
         */
        static _computeWorker(worker, id, startTime) {
            const addListener = worker.addEventListener || worker.on;
            const removeListener = worker.removeEventListener || worker.off;
            return new Promise(resolve => {
                const handler = e => {
                    removeListener.call(worker, 'message', handler);
                    resolve(e.data || e);
                };
                addListener.call(worker, 'message', handler);
                worker.postMessage({type: 'workload', id, startTime});
            });
        }

        /**
         * Allocates and initializes a worker.
         * @param {WebAssembly.Module=} wasm - The WASM module, if available, that contains the workload.
         * @returns {Promise<any>}
         * @private
         */
        static _initWorker(wasm = null) {
            return new Promise((resolve, reject) => {
                const worker = new WorkerFactory();

                const addListener = worker.addEventListener || worker.on;
                const removeListener = worker.removeEventListener || worker.off;

                const handler = e => {
                    removeListener.call(worker, 'message', handler);
                    const message = e.data || e;
                    if (message === 'success') {
                        resolve(worker);
                    } else {
                        worker.terminate();
                        reject();
                    }
                };
                addListener.call(worker, 'message', handler);
                worker.postMessage({type: 'init', wasm});
            });
        }

        /**
         * Estimates if all the cores, based on the results in the provided `stats` object, are running at the same time and
         * performing the same number of operations.
         * @param {Array} baseStats - The stats resulting from running tests loops on a single core.
         * @param {Array} stats - The stats of multiple cores to test against.
         * @param {number} threshold - Threshold, between 0 ans 1, that defines when a core is not considered physical.
         * @returns {boolean}
         * @private
         */
        static _areAllCoresValid(baseStats, stats, threshold) {
            let iterations = 0;
            stats.sort((a, b) => b.iterations - a.iterations);
            for (let i = 0; i < stats.length; ++i) {
                iterations += stats[i].iterations;
            }

            // console.log(stats);

            const local = stats[stats.length - 1].iterations / stats[0].iterations;
            const global = iterations / (baseStats[0].iterations * stats.length);
            const combined = local * 0.85 + global * 0.15;
            // console.log(`threads:${stats.length} local:${local} global:${global} estimated:${combined}\n`);

            return combined >= threshold;
        }
    }

    /**
     * @typedef {Object} WebCPUResult
     *
     * @property {number|null} reportedCores
     * The result of `navigator.hardwareConcurrency` or `null` if not supported. `navigator.hardwareConcurrency` returns the
     * total number of cores in the system, physical and logical. This is not particularly useful for data computations
     * because logical cores do no improve and, in some cases, even hinder performance in repetitive tasks.
     *
     * @property {number} estimatedIdleCores
     * This number represents the estimated number of cores that can be used to compute a repetitive task, like data
     * computations, in parallel. The result of the estimation is affected by system workload at the time of the detection,
     * if this number is used to spawn threads, it is recommended to re-run the detection algorithm periodically to always
     * use an optimal number of cores when computing data.
     *
     * @property {number} estimatedPhysicalCores
     * Given the reported number of cores and the result of estimated idle cores, this number represents the "best guess"
     * for the total number of physical cores in the system. This number of threads is safe to use on all platforms.
     */

    exports.WebCPU = WebCPU;

    Object.defineProperty(exports, '__esModule', { value: true });

});
