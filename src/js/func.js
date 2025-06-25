/**
 * DOM Ready
 */
$(document).ready(function() {
    //-----------------//
    // Initializations //
    //-----------------//

    /**
     * Populates the DOM with values from contants
     */
    populateDOM();

    /**
     * Get quote from API
     */
    fetchQuote();

    /**
     * Check user settings in Local Storage
     */
    checkSettings();

    /**
     * Initialize custom select dropdowns
     */
    $("select").dropdown();


    /**
     * Auto-refresh quotes functionality
     */
    if ($("#auto-refresh-quote-toggle").is(":checked")) {
        var autoRefresh = setInterval(function() {
            $("#quote, #author, #suggestor").css("opacity", "0");
            setTimeout(fetchQuote, 300);
        }, 15000);
    }


    //-----------------------//
    // Click functionalities //
    //-----------------------//

    /**
     * Load new quote
     */
    $("#new-quote").click(function() {
        $("#quote, #author, #suggestor").css("opacity", "0");
        //$("#background-image").css("opacity", "0");
        setTimeout(fetchQuote, 300);
    });

    /**
     * Popups functionality
     */
    $(".popup-toggle").click(function() {
        var popup = $(this).attr("data-popup");
        $(".popup-toggle").not(this).removeClass("active");
        $(this).toggleClass("active");
        $(".popup:not(#"+popup+")").removeClass("active");
        $("#"+popup).toggleClass("active");
    });

    /**
     * Top sites grid toggle functionality
     */
    $("#grid-btn").click(function() {
        $("#top-sites").toggleClass("active");
        $("#grid-btn").toggleClass("active");
        $("#quote-wrapper").toggleClass("top-sites-active");
    });

    // Facebook sharing functionality removed


    //------------------------//
    // Settings functionality //
    //------------------------//

    /**
     * Toggles functionality
     */
    $(".settings-toggle").change(function() {
        var context = $(this).attr("data-context");
        $("#"+context).toggleClass("active");
        
        if (context === "top-sites") {
            $("#grid-btn").toggleClass("active");
            $("#quote-wrapper").toggleClass("top-sites-active");
        }

        if (context === "background") {
            $("#background-image").toggleClass("show");
        }

        if (context === "auto-refresh") {
            if ($("#auto-refresh-quote-toggle").is(":checked")) {
                autoRefresh = setInterval(function() {
                    $("#quote, #author, #suggestor").css("opacity", "0");
                    setTimeout(fetchQuote, 300);
                }, 15000);
            } else {
                clearInterval(autoRefresh);
            }
        }
        
        storeSettings();
    });

    /**
     * Color picking functionality
     */
    $(".color").click(function() {
        var context = $(this).attr("data-context");
        var color = $(this).attr("data-color");
        
        $("#"+context+"-list .color").removeClass("selected");
        $(this).addClass("selected");
        
        if (context === "background-color") {
            document.documentElement.style.setProperty('--background-color', color);
        } else if (context === "font-color") {
            document.documentElement.style.setProperty('--font-color', color);
        }
        
        storeSettings();
    });

    /**
     * Select dropdowns functionality
     */
    $(".dropdown-link").click(function() {
        var context = $(this).parent().parent().parent().parent().parent().parent().prev("select").attr("data-context");
        var font = $(this).find("span").text();
        var settings = [];

        if (context === "quote") {
            setFont(font, context);
            settings.quoteFont = font;
        } else if (context === "author") {
            setFont(font, context);
            settings.authorFont = font;
        }

        storeSettings(settings);
    });

    /**
     * Set background color for color picking elements based on their data-color attribute
     */
    $(".color").each(function() {
      var color = $(this).attr("data-color");
        $(this).css('background', color);
    });
});

/**
 * Populates the DOM with values from contants
 */
function populateDOM() {
    populateColors();
    populateDropdowns();
}

/**
 * Populates the color rows
 */
function populateColors() {
    let colorRows = $(".color-row");
    let colorRowBackgroundColors = colorRows[0];
    let colorRowFontColors = colorRows[1];

    for (let color of colors) {
        colorRowBackgroundColors.innerHTML +='<div class="color" data-color="' + color + '" data-context="background-color"></div>';
        colorRowFontColors.innerHTML += '<div class="color" data-color="' + color + '" data-context="font-color"></div>';
    }
}

function populateDropdowns() {
    let quoteFontDropdown = $("select#quote-font-select");
    let authorFontDropdown = $("select#author-font-select");

    for (let font of fonts) {
        quoteFontDropdown.append('<option value="' + font.value + '">' + font.name + '</option>');
        authorFontDropdown.append('<option value="' + font.value + '">' + font.name + '</option>');
    }
}

/**
 * Checking settings stored in Local Storage
 */
function checkSettings() {
    var settings = localStorage.getItem("settings");

    // If settings do not exist, create them
    if(!settings) {
        // Create a copy of defaultSettings to avoid const issues
        var defaultCopy = {
            quoteFont: defaultSettings.quoteFont,
            authorFont: defaultSettings.authorFont,
            alwaysShowTopSites: defaultSettings.alwaysShowTopSites,
            showBackgroundImage: defaultSettings.showBackgroundImage,
            autoRefreshQuote: defaultSettings.autoRefreshQuote,
            backgroundColor: defaultSettings.backgroundColor,
            fontColor: defaultSettings.fontColor
        };
        storeSettings(defaultCopy);
        settings = localStorage.getItem("settings");
    }

    // If settings exist, apply them
    if(settings) {
        settings = JSON.parse(settings);

        // Set fonts
        setFont(settings.quoteFont, "quote");
        $("#quote-font-select").val(settings.quoteFont);
        setFont(settings.authorFont, "author");
        $("#author-font-select").val(settings.authorFont);

        // Set Background color
        document.documentElement.style.setProperty('--background-color', settings.backgroundColor);
        $("#background-color-list .color").removeClass("selected");
        $("#background-color-list .color[data-color='" + settings.backgroundColor + "']").addClass("selected");

        // Set font color
        document.documentElement.style.setProperty('--font-color', settings.fontColor);
        $("#font-color-list .color").removeClass("selected");
        $("#font-color-list .color[data-color='" + settings.fontColor + "']").addClass("selected");

        // Enable "Always show top sites" toggle
        if(settings.alwaysShowTopSites === true) {
            $("#quote-wrapper").toggleClass("top-sites-active");
            setTimeout(function() {
                $("#top-sites").toggleClass("active");
                $("#grid-btn").toggleClass("active");
            }, 1000);
            $("#top-sites-toggle").prop("checked", true);
        }

        // Handle background image toggle
        if(settings.showBackgroundImage === false) {
            $("#background-image").removeClass("show");
            $("#background-toggle").prop("checked", false);
        } else {
            $("#background-image-loader").on("load", function() {
                var backgroundImageUrl = $("#background-image-loader").attr("src");
                $("#background-image").css("background-image", "url(" + backgroundImageUrl + ")");
                $("#background-image").css("opacity", "0.25");
            });
        }

        // Handle auto-refresh toggle
        if(settings.autoRefreshQuote === true) {
            $("#auto-refresh-quote-toggle").prop("checked", true);
        } else {
            $("#auto-refresh-quote-toggle").prop("checked", false);
        }
    }
}

/**
 * Store settings in Local Storage
 */
function storeSettings(defaultSettingsObject) {
    // Create a proper copy to avoid const reference issues
    var settingsToUse = {};
    if (defaultSettingsObject) {
        settingsToUse = JSON.parse(JSON.stringify(defaultSettingsObject));
    }

    // Get values from form
    var quoteFont = settingsToUse.quoteFont || $("#quote-font-select option:selected").val();
    var authorFont = settingsToUse.authorFont || $("#author-font-select option:selected").val();
    var alwaysShowTopSites = settingsToUse.alwaysShowTopSites || $("#top-sites-toggle").is(":checked");
    var showBackgroundImage = settingsToUse.showBackgroundImage || $("#background-toggle").is(":checked");
    var autoRefreshQuote = settingsToUse.autoRefreshQuote || $("#auto-refresh-quote-toggle").is(":checked");
    var backgroundColor = settingsToUse.backgroundColor || $("#background-color-list").find(".selected").attr("data-color");
    var fontColor = settingsToUse.fontColor || $("#font-color-list").find(".selected").attr("data-color");

    // Save them to the settings object
    var settings = {
        quoteFont: quoteFont,
        authorFont: authorFont,
        alwaysShowTopSites: alwaysShowTopSites,
        showBackgroundImage: showBackgroundImage,
        autoRefreshQuote: autoRefreshQuote,
        backgroundColor: backgroundColor,
        fontColor: fontColor
    };

    // Store in local storage
    localStorage.setItem("settings", JSON.stringify(settings));
}

/**
 * Fetching quote data - always offline now
 */
function fetchQuote() {
    fetchOfflineQuote();
}

/**
 * Fetching quote from locally stored Array with quotes and images
 */
function fetchOfflineQuote() {
    // Pick a random quote from the locally stored array
    var quote = offlineQuotes[Math.floor(Math.random() * offlineQuotes.length)];

    // Set the quote and author
    $("#quote").html(quote.quote);
    $("#author").html(quote.author);

    // Show the quote with a fade-in effect
    setTimeout(function() {
        $("#quote, #author").css("opacity", "1");
    }, 250);

    // Fetch image of author
    $("#background-image-loader").attr("src", "../images/offline/" + convertAuthorName(quote.author) + ".jpg");

    // Show offline notice
    $("#offline-notice").addClass("show");
}

/**
 * Show background image when it's loaded
 */
function showBackgroundWhenLoaded() {
    $("#background-image-loader").one("load", function() {
        var backgroundImageUrl = $("#background-image-loader").attr("src");
        $("#background-image").css("background-image", "url(" + backgroundImageUrl + ")");
        $("#background-image").css("opacity", "0.25");
    }).each(function() {
        if(this.complete) {
            $(this).load();
        }
    });
}

/**
 * Load font from external source
 */
function loadFont(font, context) {
    WebFont.load({
        google: {
            families: [font]
        },
        classes: false,
        active: function() {
            if(context === "quote") {
                document.documentElement.style.setProperty('--quote-font', font);
            } else if(context === "author") {
                document.documentElement.style.setProperty('--author-font', font);
            }
        }
    });
}

/**
 * Set font for specific contexts
 */
function setFont(font, context) {
    // Check if font is one of the default fonts
    // If so, set it directly instead of loading it from Google Fonts
    if(defaultFonts.indexOf(font) !== -1) {
        if(context === "quote") {
            document.documentElement.style.setProperty('--quote-font', font);
        } else if(context === "author") {
            document.documentElement.style.setProperty('--author-font', font);
        }
    } else {
        loadFont(font, context);
    }
}

/**
 * Convert author name to use as filename
 */
function convertAuthorName(author) {
    return author.toLowerCase().replace(/ /g, "-").replace(/[, .]+/g, "");
}

/**
 * Click-away popup functionality
 */
$(document).mouseup(function(e) {
    var infoPopup = $("#info-popup");
    var infoBtn = $("#info-btn");
    var settingsPopup = $("#settings-popup");
    var settingsBtn = $("#settings-btn");

    // Info popup
    if (!infoPopup.is(e.target) && !infoBtn.is(e.target) && infoPopup.has(e.target).length === 0 && infoBtn.has(e.target).length === 0) {
        infoPopup.removeClass("active");
        infoBtn.removeClass("active");
    }

    // Settings popup
    if (!settingsPopup.is(e.target) && !settingsBtn.is(e.target) && settingsPopup.has(e.target).length === 0 && settingsBtn.has(e.target).length === 0) {
        settingsPopup.removeClass("active");
        settingsBtn.removeClass("active");
    }
});


