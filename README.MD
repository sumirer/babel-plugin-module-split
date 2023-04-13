## babel-plugin-module-split

## Installation

```shell
yarn add babel-plugin-module-split --dev

npm install babel-plugin-module-split --save-dev
```

## Usage

add babel config
``babel.config.js``

```js
module.exports = {
    presets: [
        ...
    ],
    "plugins": [
        [
            "module-split",
            {
                modules: [
                    {match: /\.\/utils$/, root: 'test/__fixtures__/import', ext: '.js'},
                    {
                        match: /\.\/utils2$/,
                        root: 'test/__fixtures__/import',
                        ext: '.js',
                    },
                ],
                alias: {},
            }
        ]
    ]
}

```

## Effect

transform mode dependencies like

```js
import {Test, Test1, write as fsWrite, write} from './utils'
import {Test as Next, Test1 as Next1} from './utils'
import * as Test13 from './utils/Test'

import {Test as NextTest, Test1 as Nexttext1} from './utils2'

Test.testMode();
Next.testMode();

Test1.testMode1();
Next1.testMode1();
NextTest();
Nexttext1();
fsWrite();
write()

```

to 
```js
import * as Test from "./utils/Test";
import * as Test1 from "./utils/Test1";
import { write as fsWrite } from "fs";
import { write } from "fs";
import * as Next from "./utils/Test";
import * as Next1 from "./utils/Test1";
import * as Test13 from './utils/Test';
import { default as NextTest } from "./utils2/Test";
import { default as Nexttext1 } from "./utils2/Test1";
Test.testMode();
Next.testMode();
Test1.testMode1();
Next1.testMode1();
NextTest();
Nexttext1();
fsWrite();
write();
```
plugin can refine module dependencies, resolve packaging dependency issues
