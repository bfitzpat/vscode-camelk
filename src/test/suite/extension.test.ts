/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

import * as vscode from 'vscode';
import * as assert from 'assert';
import * as kamel from '../../kamel';
import * as config from '../../config';
import {suite, test} from 'mocha';

suite("ensure camelk extension exists and is accessible", function() {
	const extensionId = 'redhat.vscode-camelk';

	test('vscode-camelk extension should be present', function(done) {
		assert.ok(vscode.extensions.getExtension(extensionId));
		done();
	});

	test('vscode-camelk extension should activate', function () {
		let extension = vscode.extensions.getExtension(extensionId);
		if (extension !== null && extension !== undefined) {
			extension.activate().then(() => {
				if (extension !== null && extension !== undefined) {
					const camelKIsActive = extension.isActive;
					assert.deepEqual(camelKIsActive, true);
				}
			});
		} else {
			assert.fail("Camel K extension is undefined");
		}
	});	


	test('test optional namespace support', function(done) {
		let cmdStrNoNS : string = kamel.getBaseCmd(`fakepath`,`fakecommand`, undefined);
		assert.equal(cmdStrNoNS.indexOf('--namespace'), -1);

		let cmdStrWithNS : string = kamel.getBaseCmd(`fakepath`,`fakecommand`, 'fakens');
		assert.equal(cmdStrWithNS.indexOf('--namespace') > 0, true);

		done();
	});

	test('test setting namespace to undefined', async function() {
		// get NS from config settings
		const namespace : string | undefined = config.getNamespaceconfig();

		// reset to undefined
		await config.addNamespaceToConfig(undefined);

		// get NS from config settings
		const resetNs : string | undefined = config.getNamespaceconfig();

		// by default this should be undefined
		assert.equal(resetNs, undefined);

		// reset to old value
		await config.addNamespaceToConfig(namespace);
	});

	test('test setting namespace to other value', async function() {
		// get NS from config settings
		const namespace : string | undefined = config.getNamespaceconfig();

		// get NS from config settings
		const testNs = 'testing';

		// override namespace
		await config.addNamespaceToConfig(testNs).then ( async () => {
			// re-retrieve namespace, should be test NS we specified
			const resetNs : string | undefined = config.getNamespaceconfig();

			// this should be 'testing'
			assert.equal(resetNs, testNs);

			// reset to old value
			await config.addNamespaceToConfig(namespace);
		});
	});	
});
