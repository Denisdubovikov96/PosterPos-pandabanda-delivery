import '../css/main.less';
import React from 'react';
import ReactDOM from 'react-dom';

// Required for work on iOS 9b
import 'babel-polyfill';

import PosterPickCourer from '../poter-pick-courer/poster-pick-courer';

function ExampleApp() {
    // Чтобы отобразить нужный пример просто закомментируйте не нужныйе компоненты

    return <PosterPickCourer />;
}

ReactDOM.render(<ExampleApp />, document.getElementById('app-container'));
