import { createTag } from '../../scripts/utils.js';

// ===== CONFIGURATION =====

const CONFIG = {
  DEFAULT_SPACING: 'xxs-spacing',
  DEFAULT_LOGO_ICON: 'l-logo-icon',
  DEFAULT_CLOSE_ICON: 'xxs-close-icon',
};

const LANA_OPTIONS = { tags: 'ribbon', errorType: 'i' };

// ===== UTILITY FUNCTIONS =====

function logError(message, error) {
  window.lana?.log(`${message}: ${error}`, LANA_OPTIONS);
}

// ===== PARAMS PARSING FUNCTIONS =====

function getBlockClasses(block) {
  const classList = Array.from(block.classList);
  const spacingClass = classList.find((cls) => cls.endsWith('-spacing')) || CONFIG.DEFAULT_SPACING;
  const logoIconClass = classList.find((cls) => cls.endsWith('-logo-icon')) || CONFIG.DEFAULT_LOGO_ICON;
  const closeIconClass = classList.find((cls) => cls.endsWith('-close-icon')) || CONFIG.DEFAULT_CLOSE_ICON;

  return {
    spacing: spacingClass,
    logoIcon: logoIconClass,
    closeIcon: closeIconClass,
  };
}

// ===== DOM BUILDING FUNCTIONS =====

function createRibbonContainer() {
  const container = createTag('div', { class: 'ribbon-container' });

  const logoWrapper = createTag('div', { class: 'ribbon-logo' });
  const contentWrapper = createTag('div', { class: 'ribbon-content' });
  const closeWrapper = createTag('div', { class: 'ribbon-close' });

  container.appendChild(logoWrapper);
  container.appendChild(contentWrapper);
  container.appendChild(closeWrapper);

  return { container, logoWrapper, contentWrapper, closeWrapper };
}

// ===== SECTION PROCESSING FUNCTIONS =====

function processLogoSection(logoSection, logoWrapper) {
  try {
    if (!logoSection) return;

    const logoLink = logoSection.querySelector('div > a');
    if (logoLink) {
      logoWrapper.appendChild(logoLink.cloneNode(true));
    }
  } catch (error) {
    logError('Failed to process logo section', error);
  }
}

function processContentSection(contentSection, contentWrapper) {
  try {
    if (!contentSection) return;

    const textContent = contentSection.querySelector('div');
    if (textContent) {
      contentWrapper.appendChild(textContent.cloneNode(true));
    }
  } catch (error) {
    logError('Failed to process content section', error);
  }
}

function processCloseSection(closeSection, closeWrapper) {
  try {
    if (!closeSection) return;

    const closeLink = closeSection.querySelector('div > a');
    if (closeLink) {
      closeWrapper.appendChild(closeLink.cloneNode(true));
    }
  } catch (error) {
    logError('Failed to process close section', error);
  }
}

// ===== MAIN FUNCTION =====

export default function decorate(block) {
  if (!block) return;

  try {
    const sections = Array.from(block.children);
    const logoSection = sections[0]; // Adobe logo
    const contentSection = sections[1]; // Text content
    const closeSection = sections[2]; // Close button

    const { container, logoWrapper, contentWrapper, closeWrapper } = createRibbonContainer();

    // Apply size classes for spacing, logo-icon and close-icon
    const classes = getBlockClasses(block);
    container.classList.add(classes.spacing);
    logoWrapper.classList.add(classes.logoIcon);
    closeWrapper.classList.add(classes.closeIcon);

    // Processing each section
    processLogoSection(logoSection, logoWrapper);
    processContentSection(contentSection, contentWrapper);
    processCloseSection(closeSection, closeWrapper);

    block.textContent = '';
    block.appendChild(container);
  } catch (error) {
    logError('Failed to initialize ribbon block', error);
  }
}
