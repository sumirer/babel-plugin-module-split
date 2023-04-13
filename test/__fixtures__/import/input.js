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
