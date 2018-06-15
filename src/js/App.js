import React from 'react';

import Operation from './redux/Operation';
import PartsField from './redux/PartsField';
import PlayField from './redux/PlayField';

const App = () => (
    <div>
        <PlayField />
        <PartsField />
        <Operation />
    </div>
);
export default App;

