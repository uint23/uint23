# A Comprehensive Guide on Creating a Window Manger
### > uint23 - August 1st 2025

## Table of Contents
1. [Introduction](#introduction)
2. [What is a Window Manager?](#what-is-a-window-manager?)

## Introduction
So, you want to create a window manager huh? Well.. good new for you, I can help! This guide is deep and in-depth
covering _all_ the bases when it comes to making a window manager with *X11*. I apologise to the Wayland goons, but
with a library like `wlroots` you can follow the concepts closely. If you are on Wayland, you may also want to check out
dwl, as it's quite a "minimal" window manager that you may be able to closely examine.

Why create your own window manager? Well, there are many reasons one can have; I created mine because I was unhappy with
DWM and how patching more than one subpar patch would break my whole build, so I just created one that does all that I need!

## Prerequisites
Unfortunately you do need to know _some_ things about programming and Linux to follow along, but I assume you came here
already knowing the basics. We will also be using Xlib because it is simple and you can always port your
window manager to xcb in the future -- for a small window manager Xlib should be plenty. Here is what we will be using
during this guide. Don't worry, there aren't a gazzilion dependancies you need, just the basics:

* X11 - You need the libraries provided with X11 such as Xlib (duh).
* A programming language with Xlib binds (look that up).
* Xephyr - A nested XServer. With this you can test your wm with ease.
* Make - We will be using make for a nice and easy build system.
* Man pages - Fish are friends not food.

> Note: We will be using C for this guide, simply because it is the greatest programming language ever created and those
> who disagree are wrong and should be shunned from society - Verified Statistic.

## What is a Window Manager?
In it's simplest form, a window manager is a program that manages windows >u<

Ok, serious - A window manager is a program that acts like a mediator between the display server and the user, the
XServer in our case, handling the communication between them.

Now X11 uses a events based model on how it sends / recieves data. In the Xlib header, we have a datatype called `XEvent`
The `XEvent` datatype holds a union of a bunch of information that may be needed. Here is a preview of the union:

```c
/* this is from the man page */
typedef union _XEvent {
    int type;       /* must not be changed */
    XAnyEvent xany;
    XKeyEvent xkey;
    ...
    XErrorEvent xerror;
    XKeymapEvent xkeymap;
    long pad[24];
} XEvent;
```

> The type field determines which member of the union is valid. Xlib provides a set of `#defines` (like KeyPress,
> MapRequest, DestroyNotify) that correspond to the event types you’ll handle in your event loop - a loop that waits for
> events (such as a keypress, mouse click etc) and handles them by calling the appropriate handler function.


