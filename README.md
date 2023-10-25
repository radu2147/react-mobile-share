## react-mobile-share ![Checks](https://github.com/radu2147/react-mobile-share/actions/workflows/checks.yml/badge.svg)

A small package developed on top of mobile's built-in share api (See [Web share api](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)). It has support for both sync share operations (when the url is known already), as well as async (e.g. to be used for shortlink generation)
### Features

- [X] Full behaviour customization
- [X] Sync share support wrapper component
- [X] Sync share support hook
- [X] Async share support wrapper component
- [X] Async share support hook
- [ ] Support for images

### Install

```
npm i -D react-mweb-share
yarn add -D react-mweb-share
```

### Examples
Sync version:

```
import * as React from 'react';
import { useMobileShare } from 'react-mweb-share';

const Button = ({url}: {url: string}) => {
    const { share } = useMobileShare({url, title: "Howdy"});
    return (
        <button onClick={share}>
            Share!
        </button>
    );
}
```

Async version:

```
import * as React from 'react';
import { useMobileShareAsync } from 'react-mweb-share';

const Button = () => {
    const generateURL = new Promise((res) => res({url: "https://radu2147.github.io"}));
    const { share, loading } = useMobileShareAsync({generateURL, title: "Howdy"});
    if(loading){
        return <p>Loading...</p>
    }
    return (
        <button onClick={share}>
            Share!
        </button>
    );
}
```

Wrapper component:

```
import * as React from 'react';
import { MobileShareWrapper } from 'react-mweb-share';

const Button = ({url}: {url: string}) => {
    return (
        <MobileShareWrapper url={url} title={"Howdy"}>
            <button onClick={share}>
                Share!
            </button>
        </MobileShareWrapper>
    );
}
```

Async wrapper component:

```
import * as React from 'react';
import { MobileShareAsyncWrapper } from 'react-mweb-share';

const Button = () => {
    const generateURL = new Promise((res) => res({url: "https://radu2147.github.io"}));
    const [showDialog, setShowDialog] = React.useState(false);
    return (
        <>
            <MobileShareAsyncWrapper generateURL={generateURL} title={"Howdy"} onLoad={() => setShowDialog(true)} onSuccess={() => setShowDialog(false)}>
                <button onClick={share}>
                    Share!
                </button>
            </MobileShareAsyncWrapper>
            <Dialog visible={showDialog} toggleDialog={() => setShowDialog(!showDialog)}/>
        </>
    );
}
```

### License
[MIT](LICENSE)
