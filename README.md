# ASRQA_Interface

This repository contains all the components needed to run the Earudite platform. In summary, Earudite is a platform designed to crowdsource the collection of training data using Quiz bowl questions to improve automatic speech recognition systems.

## Installation

To install this repository, simply clone it into your directory of choice using the following command:
```bash
$ git clone https://github.com/saptab/ASRQA_Interface.git
```
Then, follow the installation instructions in the README for each sub-repository. The HLS server component requires no additional installation steps aside from generating a secure handshake.

## Running

Prior to running the platform, make sure that each reference uses the same port for a given component. Use the following ports:
* HLS: 4440
* Data Flow Server: 5110
* Socket Server: 6470
* Frontend + Proxy: 8700
* Internal MongoDB Port (if MongoDB is run locally): 27019

The following series of commands shows how to run the platform:
```bash
$ cd ASRQA_Interface/server
$ module load nodejs
$ module load ffmpeg
$ npx pm2 start server.js --name ASRQA -o ./out.log -e ./err.log
$ npx pm2 save --force
$ export Q_INST_PATH=/fs/clip-quiz/saptab1/ASRQA/ASRQA_Interface/quizzr-server
$ export CONNECTION_STRING=<DATA-FLOW-SERVER-CONNECTION-STRING>
$ cd ../quizzr-socket-server/
$ nohup nice python main-with-arg.py > MMMDD_log.txt &
$ cd ../quizzr-server/
$ nohup nice python server.py > MMMDD_log.txt &
$ cd ../hls/
$ nohup nice ./Go-HLS-Streamer --config hls.yaml serve > MMMDD_log.txt &
```
Replace `<DATA-FLOW-SERVER-CONNECTION-STRING>` with the connection string discussed in [quizzr-server/README.md](quizzr-server/README.md) and `MMMDD` with the current month and day. Example: `May21`.

## Project Team Members

Saptarashmi Bandyopadhyay

Shivam Malhotra

Andrew Chen

Christopher Rapp
