console.log('app loaded');

const API_ROUTE = 'https://sandalwood.mystagingwebsite.com/wp-json/' // define main site URL

/* initialize app */

getSiteInfo();
setupMenu();
listenForPageChange();

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
    const siteTitle = document.getElementById('siteTitle');
    siteTitle.innerText = name;
};

function setSiteDescription( description ) {
    const siteTitle = document.getElementById('siteDescription');
    siteTitle.innerText = description;
};

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
};

function renderMenu( pages ) {
    pages.map( page => addMenuItem( page.slug, page.title.rendered ));
};

function addMenuItem( slug, title ) {  
    const menuItem = document.createElement( 'li' ); 
    const menuLink = document.createElement( 'a' );
    menuLink.title = title;
    menuLink.href = `#${slug}`;
    menuLink.innerText = title;
    menuItem.appendChild(menuLink);
    const mainMenu = document.getElementById( 'mainMenu' );
    mainMenu.appendChild( menuItem );
};

/* router */

function listenForPageChange() {
  window.addEventListener( 'hashchange', loadContent, false );
};

function loadContent() {  
  const slug = getSlug();
  if ( null === slug || 'home' === slug ) {
    console.log( 'blog' );
  } else {
    getPageContent( slug );
  }
};

function getSlug() {
  slug = window.location.hash;
  if( "" === slug ) {
    return null;
  } else {
    return slug.substr( 1 );
  }
};

function getPageContent( slug ) {
  fetch( API_ROUTE + 'wp/v2/pages?slug=' + slug )
  .then(response => {
    if (response.status !== 200) {
      console.log("Problem! Status Code: " + response.status);
      return;
    }
    response.json().then(data => {
      console.log(data[0].title.rendered);
      setPageHeading(data[0].title.rendered);
      setPageContent(data[0].content.rendered);
      if ( slug != '' | slug != 'home' ) {
          clearSidebar();
      }
    });
  })
  .catch(function(err) {
    console.log("Error: ", err);
  });    
};

function setPageContent( content ) {
  const pageContentInner = document.getElementById( 'contentInner' );
  clearContent();
  pageContentInner.innerHTML = content;
};

/* utilities */

function clearContent() {
  const pageContentInner = document.getElementById( 'contentInner' );
  pageContentInner.innerHTML = '';
};

function clearSidebar() {
  const sidebarContent = document.getElementById( 'sidebar' );
  sidebarContent.innerHTML = '';
};

function setPageHeading( heading ) {
  const header =  document.getElementById( 'pageHeader' );
  header.innerText = heading;
};