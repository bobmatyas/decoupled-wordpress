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
    getBlogPostList();
  } else if ( 'media' === slug ) {
    getMedia();
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

/* get content by page slug */

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

/* get site media */

function getMedia() {
  fetch( API_ROUTE + 'wp/v2/media')
  .then(response => {
    if (response.status !== 200) {
      console.log("Problem! Status Code: " + response.status);
      return;
    }
    response.json().then(data => {
      setPageHeading( 'Media' );
      clearContent();
      data.map( img => renderImage( img.source_url, img.alt_text ));
    });
  })
  .catch(function(err) {
    console.log("Error: ", err);
  });    
};

function renderImage ( image, alt_text ) {
  const img = document.createElement( 'img' );
        pageContent = document.getElementById( 'contentInner' );
  img.src = image;
  img.alt = alt_text;
  img.classList = 'img-responsive img-margin';

  pageContent.appendChild( img );
};

/* blog display */

function getBlogPostList( offset ) {
  
  let route = API_ROUTE + 'wp/v2/posts'
  
  if ( offset != null ) {
    route = route + 'offset=' + offset;
  }

  fetch( route )
  .then(response => {
    if (response.status !== 200) {
      console.log("Problem! Status Code: " + response.status);
      return;
    }
    response.json().then(data => {
      setPageHeading( 'Blog' );
      clearContent();
      clearSidebar();
      getAllTags();
      data.map( post => renderPost( post.title.rendered, post.slug, post.date, post.excerpt.rendered ));
    });
  })
  .catch(function(err) {
    console.log("Error: ", err);
  });    
};

function renderPost( title, slug, date, excerpt) {
  const contentInner = document.getElementById( 'contentInner' );
  const postHolder = document.createElement( 'article' );
        postLink = document.createElement( 'h3' );
        postMeta = document.createElement( 'p' );
        postExcerpt = document.createElement( 'p' );
        postReadMoreHolder = document.createElement( 'p' );
        postReadMoreLink = document.createElement( 'a' );
        postSeparator = document.createElement( 'hr' );

        postLink.innerText = title;
        postMeta.innerText = formatDate( date );
        postExcerpt.innerHTML = excerpt;
        postReadMoreLink.href = `/blog/#${slug}`;
        postReadMoreLink.innerText = `Read More`;

        postHolder.appendChild( postLink );
        postHolder.appendChild( postMeta );
        postHolder.appendChild( postExcerpt );
        postReadMoreHolder.appendChild( postReadMoreLink );
        postHolder.appendChild( postReadMoreHolder );
        postHolder.appendChild( postSeparator );
        
        contentInner.appendChild( postHolder );
};

function getAllTags() {
  fetch( API_ROUTE + 'wp/v2/tags')
  .then(response => {
    if (response.status !== 200) {
      console.log("Problem! Status Code: " + response.status);
      return;
    }
    response.json().then(data => {
      renderTaxonomyHolder( 'tags' );
      data.map( tag => renderTaxonomyList( 'tags', tag.id, tag.name ));
    });
  })
  .catch(function(err) {
    console.log("Error: ", err);
  });    
};

function renderTaxonomyHolder( type ) {
  const taxonomyHolder = document.createElement( 'div' );
        taxonomyHeading = document.createElement( 'h4' );
        taxonomyList = document.createElement( 'ul' );
        sideBar = document.getElementById( 'sideBar' );

  taxonomyHolder.id =  `${type}Holder`;
  taxonomyList.id = `${type}List`;
  type = type[0].toUpperCase() + type.substring(1);
  taxonomyHeading.innerText = type;

  sideBar.appendChild( taxonomyHolder );
  sideBar.appendChild( taxonomyHeading );
  sideBar.appendChild( taxonomyList );
};

function renderTaxonomyList( type, id, name ) {
  const taxonomyItem = document.createElement( 'li' );
        taxonomyLink = document.createElement( 'a' );
        taxonomyList = document.getElementById( type + 'List');
        console.log( taxonomyList );
        taxonomyLink.href = `${type}/#${id}`
        taxonomyLink.innerText = name;
        taxonomyItem.appendChild( taxonomyLink );
        taxonomyList.appendChild( taxonomyItem );
};


/* utilities */

function clearContent() {
  const pageContentInner = document.getElementById( 'contentInner' );
  pageContentInner.innerHTML = '';
};

function clearSidebar() {
  const sideBarContent = document.getElementById( 'sideBar' );
  sideBarContent.innerHTML = '';
};

function setPageHeading( heading ) {
  const header =  document.getElementById( 'pageHeader' );
  header.innerText = heading;
};

function formatDate( date ) {
  const dateFromApi = new Date( date );
        dateFormatted = dateFromApi.toLocaleDateString() + " " + dateFromApi.toLocaleTimeString();
  
  return dateFormatted;
};