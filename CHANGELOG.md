# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Released]

## [1.1.1] - 2022-06-12
### Removed
- Unused dependencies
- Reference to RapidAPI in welcome message

### Fixed:
- Error connecting to Redis Cloud

## [1.1.0] - 2022-03-31
### Added:
- Manga now include a ratedMature value. This value is true if any chapters are restricted to users over the age of 18. Manga with this flag have chapters that are only availabe online and will not appear in in either the Viz or Shonen Jump app.

### Fixed:
- Updated data collection methods to not distrupt database documents 

## [1.0.0] - 2022-03-30
### Added:
- Info on over 150 manga are now available

### Fixed
- Updated data collection for manga with no viz.com urls

## [0.9.1] - 2022-03-27
### Fixed
- Updated welcomeMessage to better explain url routing

## [0.9.0] - 2022-03-27
### Added:
- Versioning to url
- More data is now pulled from both viz.com & viz.com/shonenjump for each manga
- Data is now pulled from database instead of scraping each requests

## [0.5.1] - 2022-02-17
### Added:
- Route descriptions & 400 msg on /manga/:mangaID route

## [0.5.0] - 2022-02-14
### Added:
- CHANGELOG.md for version tracking