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

'use-strict';
 
var Thingy = require('./lib/thingy'); 
var enabled;

console.log('Reading Thingy environment sensors!');

const {
  Adapter,
  Device,
  Property
} = require('gateway-addon');

class EnvTag extends Device {
  constructor(adapter, tag) {
    super(adapter, `${EnvTag.name}-${tag.id}`);
    this.tag = tag;
    this['@context'] = 'https://iot.mozilla.org/schemas/';
    this['@type'] = ['TemperatureSensor'];
    this.name = this.id;
    this.description = 'EnvTag';

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
    const property = new Property(this, description.title, description);
    this.properties.set(description.title, property);
  }

startDiscovery(thingy){
   console.log(`Connecting to ${this.id}`);
   this.Discover(thingy);
   console.log(`Connected to ${this.id}`);

/*   thingy.on('disconnect', function() {
        console.log('Disconnected!');
      });  */
   console.log('Start Discovery completed.');
  }

  async Discover(thingy) {
   await this.connectNsetup(thingy);
   console.log('Connected and Thingy setup successful.');
}

/*
function onPressureData(pressure) {
    console.log('Pressure sensor: ' + pressure);
}

function onGasData(gas) {
    console.log('Gas sensor: eCO2 ' + gas.eco2 + ' - TVOC ' + gas.tvoc );
}

function onColorData(color) {
    console.log('Color sensor: r ' + color.red +
                             ' g ' + color.green +
                             ' b ' + color.blue +
                             ' c ' + color.clear );
}

function onButtonChange(state) {
    if (state == 'Pressed') {
        if (enabled) {
            enabled = false;
            this.temperature_disable(function(error) {
                console.log('Temperature sensor stopped! ' + ((error) ? error : ''));
            });
            this.pressure_disable(function(error) {
                console.log('Pressure sensor stopped! ' + ((error) ? error : ''));
            });
            this.humidity_disable(function(error) {
                console.log('Humidity sensor stopped! ' + ((error) ? error : ''));
            });
            this.color_disable(function(error) {
                console.log('Color sensor stopped! ' + ((error) ? error : ''));
            });
            this.gas_disable(function(error) {
                console.log('Gas sensor stopped! ' + ((error) ? error : ''));
            });
        }
        else {
            enabled = true;
            this.temperature_enable(function(error) {
                console.log('Temperature sensor started! ' + ((error) ? error : ''));
            });
            this.pressure_enable(function(error) {
                console.log('Pressure sensor started! ' + ((error) ? error : ''));
            });
            this.humidity_enable(function(error) {
                console.log('Humidity sensor started! ' + ((error) ? error : ''));
            });
            this.color_enable(function(error) {
                console.log('Color sensor started! ' + ((error) ? error : ''));
            });
            this.gas_enable(function(error) {
                console.log('Gas sensor started! ' + ((error) ? error : ''));
            });
        }
    }
}

*/

   async connectNsetup(thingy){
    return new Promise((resolve, reject) => {
    thingy.connectAndSetUp(function(error) {
    if (error) {
	 console.log('Connected! ' + error ? error : '');       
          reject(error);
        } else {
          resolve();
	 console.log('Connected! ' + error ? error : '');       
        }
    });

    console.log('Connected! and register temp and humid notify');
    thingy.on('temperatureNotif', this.onTemperatureData);
    thingy.on('humidityNotif', this.onHumidityData);
    console.log('Connected! and register temp and humid notify');
/*  
    thingy.on('pressureNotif', onPressureData);
    thingy.on('gasNotif', onGasData);
    thingy.on('colorNotif', onColorData);
    thingy.on('buttonNotif', onButtonChange);
*/

    thingy.temperature_interval_set(1000, function(error) {
        if (error) {
            console.log('Temperature sensor configure! ' + error);
          reject(error);
        }else{
	  reslove();
	}
    });
    thingy.humidity_interval_set(1000, function(error) {
        if (error) {
            console.log('Humidity sensor configure! ' + error);
          reject(error);
        }
    });
/*
    thingy.pressure_interval_set(1000, function(error) {
        if (error) {
            console.log('Pressure sensor configure! ' + error);
        }
    });

    thingy.color_interval_set(1000, function(error) {
        if (error) {
            console.log('Color sensor configure! ' + error);
        }
    });
    thingy.gas_mode_set(1, function(error) {
        if (error) {
            console.log('Gas sensor configure! ' + error);
        }
    });
*/
    enabled = true;

    thingy.temperature_enable(function(error) {
       if(error){
          console.log('Temperature sensor started! ' + ((error) ? error : ''));
          reject(error);
	}
    });
    thingy.humidity_enable(function(error) {
      if(error){
          console.log('Humidity sensor started! ' + ((error) ? error : ''));
          reject(error);
       }
    });
/*
    thingy.pressure_enable(function(error) {
        console.log('Pressure sensor started! ' + ((error) ? error : ''));
    });
    thingy.color_enable(function(error) {
        console.log('Color sensor started! ' + ((error) ? error : ''));
    });
    thingy.gas_enable(function(error) {
        console.log('Gas sensor started! ' + ((error) ? error : ''));
    });
    thingy.button_enable(function(error) {
        console.log('Button started! ' + ((error) ? error : ''));
    });
*/
          resolve();
    });

  }

    onTemperatureData(temperature) {
      console.log('Temperature sensor: ' + temperature);
      console.log(`Set 'temperature' to ${value}`);
      const property = this.properties.get('temperature');
      property.setCachedValue(value);
      this.notifyPropertyChanged(property);
   }

    onHumidityData(humidity) {
    console.log('Humidity sensor: ' + humidity);
    console.log(`Set 'humidity' to ${value}`);
    const property = this.properties.get('humidity');
    property.setCachedValue(value);
    this.notifyPropertyChanged(property);
  }
}


class EnvTagAdapter extends Adapter {
  constructor(addonManager, manifest) {
  console.log('In Adapter constructor: ');
    super(addonManager, EnvTagAdapter.name, manifest.name);
    const pollInterval = manifest.moziot.config.pollInterval;
    addonManager.addAdapter(this);
    const knownDevices = {};

  console.log('Calling Thingy Discover: ');
    Thingy.discover((thingy) => {
        console.log('Discovered: ' + thingy);
        console.log('Discovered Thingy ID: ' + thingy.id);
         const knownDevice = knownDevices[thingy.id];
 
	  if (!knownDevice) {
		console.log(`Detected new EnvTag ${thingy.id}`);
		const device = new EnvTag(this, thingy);
		knownDevices[thingy.id] = device;
		this.handleDeviceAdded(device);
		device.startDiscovery(thingy);
	      }

     });	
   }
}


module.exports = EnvTagAdapter;
