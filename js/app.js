console.log('app loaded');

const API_ROUTE = 'https://sandalwood.mystagingwebsite.com/wp-json/' // define main site URL

/* initial setup */

getSiteInfo();
setupMenu();

/* get site title / description */

function getSiteInfo() { 
    fetch( API_ROUTE)
    .then(response => {
      if (response.status !== 200) {
        console.log("Problem! Status Code: " + response.status);
        return;
      }
      response.json().then(data => {
        setSiteTitle( data.name );
        setSiteDescription( data.description );
      });
    })
    .catch(function(err) {
      console.log("Error: ", err);
    });
};

function setSiteTitle( name ) {
    let siteTitle = document.getElementById('siteTitle');
    siteTitle.innerText = name;
}

function setSiteDescription( description ) {
    let siteTitle = document.getElementById('siteDescription');
    siteTitle.innerText = description;
}

/* setup menu */

function setupMenu() {
    fetch( API_ROUTE + 'wp/v2/pages?per_page=3')
    .then(response => {
      if (response.status !== 200) {
        console.log("Problem! Status Code: " + response.status);
        return;
      }
      response.json().then(data => {
        renderMenu(data);
      });
    })
    .catch(function(err) {
      console.log("Error: ", err);
    });    
}

function renderMenu( pages ) {
    pages.map( page => addMenuItem( page.slug, page.title.rendered ));
}

function addMenuItem( slug, title ) {  
    const menuItem = document.createElement( 'li' ); 
    const menuLink = document.createElement( 'a' );
    menuLink.title = title;
    menuLink.href = `#${slug}`;
    menuLink.innerText = title;
    menuItem.appendChild(menuLink);
    const mainMenu = document.getElementById( 'mainMenu' );
    mainMenu.appendChild( menuItem );
}
