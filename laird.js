/*
  Copyright (c) 2010 - 2017, Nordic Semiconductor ASA
  All rights reserved.
  Redistribution and use in source and binary forms, with or without modification,
  are permitted provided that the following conditions are met:
  1. Redistributions of source code must retain the above copyright notice, this
     list of conditions and the following disclaimer.
  2. Redistributions in binary form, except as embedded into a Nordic
     Semiconductor ASA integrated circuit in a product or a software update for
     such product, must reproduce the above copyright notice, this list of
     conditions and the following disclaimer in the documentation and/or other
     materials provided with the distribution.
  3. Neither the name of Nordic Semiconductor ASA nor the names of its
     contributors may be used to endorse or promote products derived from this
     software without specific prior written permission.
  4. This software, with or without modification, must only be used with a
     Nordic Semiconductor ASA integrated circuit.
  5. Any software provided in binary form under this license must not be reverse
     engineered, decompiled, modified and/or disassembled.
  THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS
  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
  OF MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
  DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
  LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
  CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
  HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
  LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
  OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

const {
  Adapter,
  Device,
  Property
} = require('gateway-addon');
 
var enabled;
var Noble = require('noble');
var Thingy = require('./lib/thingy'); 

var inRange = [];

var lairdServiceUuid = 'bb30e8009afb4d9ab313ba63b544c95b';
var tempCharacteristicUuid = 'bb30e8019afb4d9ab313ba63b544c95b';
var humidCharacteristicUuid = 'bb30e8029afb4d9ab313ba63b544c95b';


var lairdService = null;
var tempCharacteristic = null;
var humidCharacteristic = null;

var temperature = 0; 
var humidity = 0;

console.log('Reading Laird environment sensors!');

function readData(){
	tempCharacteristic.read(function(error, tdata) {
	  console.log('Raw Temp data:' + tdata.toString('hex'));
	  temperature = (tdata[0] + (tdata[1] / 100.0));
	  console.log('Converted Temp data:' + temperature+'oC');
	});

	humidCharacteristic.read(function(error, hdata) {
	  console.log('Raw Humid data:' + hdata.toString('hex'));
	  humidity = (hdata[0] + (hdata[1] / 100.0));
	  console.log('Converted Humid data:' + humidity +'%');
	});
}

function readDatabyPolling(){
      readData();
      timer = setInterval(() => {
      readData();
    }, 1 * 1000);
}

class LairdDevice extends Device {
  constructor(adapter, tag) {
    super(adapter, `${LairdDevice.name}-${tag.id}`);
    this.tag = tag;
    this['@context'] = 'https://iot.mozilla.org/schemas/';
    this['@type'] = ['TemperatureSensor'];
    this.name = this.id;
    this.description = 'LairdDevice';

    this.addProperty({
      type: 'number',
      '@type': 'TemperatureProperty',
      unit: 'degree celsius',
      title: 'temperature',
      description: 'The ambient temperature',
      readOnly: true
    });

    this.addProperty({
      type: 'number',
      unit: '%',
      title: 'humidity',
      description: 'The relative humidity',
      readOnly: true
    });
  }

  addProperty(description) {
    console.log(`adding ${description.title} property`);
    const property = new Property(this, description.title, description);
    this.properties.set(description.title, property);
  }

  async startPolling(interval) {
    console.log(`Connecting to ${this.id}`);
    await this.connect();
    console.log(`Connected to ${this.id}`);
    await this.discoverServicesAndCharacteristics();
    await this.sleep(500);
    this.poll();
    this.timer = setInterval(() => {
      this.poll();
    }, interval * 1000);
  }

 async poll() {
    const temp = await this.readTemperature();
    console.log(`Obtained Temperature value: ${temp}`);
    this.updateValue('temperature', temp);
    const humid = await this.readHumidity();
    console.log(`Obtained Temperature value: ${humid}`);
    this.updateValue('humidity', humid);
/*    await this.disconnect();
    console.log(`Disconnected from ${this.id}`);
    await this.sleep(500);
*/
  }

  updateValue(name, value) {
    console.log(`Set ${name} to ${value}`);
    const property = this.properties.get(name);
    property.setCachedValue(value);
    this.notifyPropertyChanged(property);
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.tag.connect(function(error) {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async discoverServicesAndCharacteristics() {
    return new Promise((resolve, reject) => {
	this.tag.discoverServices([lairdServiceUuid], function(err, services) {
      		services.forEach(function(service) {
        //
        // This must be the service we were looking for.
        //
        	console.log('found service:', service.uuid);

        //
        // So, discover its characteristics.
        //
              service.discoverCharacteristics([], function(err, characteristics) {

            	  characteristics.forEach(function(characteristic) {
            //
            // Loop through each characteristic and match them to the
            // UUIDs that we know about.
            //
           	 	console.log('found characteristic:', characteristic.uuid);

                    if (tempCharacteristicUuid == characteristic.uuid) {
              		  tempCharacteristic = characteristic;
            	    }
            	    else if (humidCharacteristicUuid == characteristic.uuid) {
              		  humidCharacteristic = characteristic;
            	    }
                  })

          //
          // Check to see if we found all of our characteristics.
          //
              if (tempCharacteristicUuid && humidCharacteristicUuid) {
            //
            // We did, so read values from sensors!
            //
		console.log('got temp and humid characteristics. Now read values from sensor.');
		//readDatabyPolling();
               }
                else {
                     console.log('missing characteristics');
               }
            })
         })
	  if(err)
		reject(err);
	  else
		resolve(err);
       });
    });
  }

  async sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  async readTemperature() {
    return new Promise((resolve, reject) => {
      tempCharacteristic.read(function(error, tdata) {
        if (error) {
          reject(error);
        } else {
	  temperature = (tdata[0] + (tdata[1] / 100.0));
          resolve(temperature);
        }
      });
    });
  }

  async readHumidity() {
    return new Promise((resolve, reject) => {
      humidCharacteristic.read(function(error, hdata) {
        if (error) {
          reject(error);
        } else {
	  humidity = (hdata[0] + (hdata[1] / 100.0));
          resolve(humidity);
        }
      });
    });
  }

  async disconnect() {
    return new Promise((resolve, reject) => {
      this.tag.on('disconnect', function(error) {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

}

class LairdAdapter extends Adapter {
  constructor(addonManager, manifest) {
    super(addonManager, LairdAdapter.name, manifest.name);
    const pollInterval = manifest.moziot.config.pollInterval;
    addonManager.addAdapter(this);
    
    Noble.startScanning([], true);
    this.DiscoverandAddDev(pollInterval);
  }

   async DiscoverandAddDev(pollInterval) {
     const knownDevices = {};
     const peripheral = await this.discover();
//     console.log(`Detected new LairdDevice ${peripheral.id} after Discover func.`);
     const knownDevice = knownDevices[peripheral.id];

      if (!knownDevice) {
        console.log(`Detected new LairdDevice ${peripheral.id}`);
        Noble.on('scanStop', function() { console.log("Scanning stopped.");});
        const device = new LairdDevice(this, peripheral);
        knownDevices[peripheral.id] = device;
        this.handleDeviceAdded(device);
        device.startPolling(pollInterval || 30);
      }
   }

   async discover() {
    return new Promise((resolve, reject) => {
      Noble.on('discover', function(peripheral) {
	console.log(`Detected new LairdDevice ${peripheral.id}`);
	  resolve(peripheral);
      });
    });
  }
}


module.exports = LairdAdapter;
