# How to use

Install exiftool - https://exiftool.org

Run `npm run start`.

TODO: Currently hard coded to use `test-data` folder. Expects Google Takeout JSON files and video files in this folder. Switch to one that makes sense or provide folder through arg.

# exiftool Reference

See EXIF data:

```
exiftool -a -s -G1 test-data/IMG_0002.MOV
```

See specific EXIF data:

```
exiftool -Time:CreateDate test-data/IMG_0002.MOV
```

Update EXIF data:

```
exiftool -Time:CreateDate="2000:01:14 17:33-08:00" test-data/IMG_0002.MOV
```

# Sources

How to use - https://exiftool.org/#running
Date time format - https://exiftool.org/faq.html#Q5
Latitude/Longitude format - https://exiftool.org/faq.html#Q14
