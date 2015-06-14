# puresec-detect-mock

This microservice is part of the [puresec ecosystem](https://github.com/fhopeman/puresec-master). It's supposed to be
a mock implementation of detectors.

## Preconditions
First of all you need a raspberry pi with installed [linux distribution](https://www.raspberrypi.org/downloads/).

## Usage
Firstly, clone the repository to your rasbperry pi and change the directory to the created folder.
To setup the microservice, you can use the `./bin/setupServer.sh` script to install npm, node and
other dependencies which are mandatory.

### Run the service
Run the following command to start the microservice:

`node src/app.js`
