var industry_schema = require('../models/industry_schema');
var store_schema = require('../models/store_schema');
var product_schema = require('../models/product_schema');
var location_schema = require('../models/location_schema');
var media_schema = require('../models/media_schema');
var tag_schema = require('../models/tag_schema');

var mongoose = require('mongoose');
var S = require('string');
var im = require('imagemagick');

var product_image_when_edit_product;

var controllers = {

    slug_factory: function (str) {
        var date = new Date();
        var hour = date.getHours();
        var minute = date.getMinutes();
        var day = date.getDate();
        var month = date.getMonth();
        var year = date.getYear();
        return(S(str).slugify().s + "-" + hour + minute + day + month + year);
    },

    get_store_array: function (req, res) {
        var store_query = store_schema.store.find({});
        store_query.sort({date: -1});
        store_query.exec(function (store_error, store_array) {
            if (store_array && store_array.length > 0) {
                req.session.store_array_all = store_array;
            } else {
                console.log(store_error);
            }
        });
    },

    get_product_array: function (req, res) {
        var product_query = product_schema.product.find({});
        product_query.sort({date: -1});
        product_query.exec(function (product_error, product_array) {
            if (product_array && product_array.length > 0) {
                req.session.product_array_all = product_array;
            } else {
                console.log(product_error);
            }
        });
    },

    get_media_array: function (req, res) {
        var media_query = media_schema.media.find({});
        media_query.sort({media_date: -1});
        media_query.exec(function (media_error, media_array) {
            if (media_array && media_array.length > 0) {
                req.session.media_array_all = media_array;
            } else {
                console.log(media_error);
            }
        });
    },

    get_industry_array: function (req, res) {
        var industry_query = industry_schema.industry.find({});
        industry_query.sort({industry_name: -1});
        industry_query.exec(function (industry_error, industry_array) {
            if (industry_array && industry_array.length > 0) {
                req.session.industry_array_all = industry_array;
            } else {
                console.log(industry_error);
            }
        });
    },

    get_location_array: function (req, res) {
        var location_query = location_schema.location.find({});
        location_query.exec(function (location_error, location_array) {
            if (location_array && location_array.length > 0) {
                req.session.location_array_all = location_array;
            } else {
                console.log(location_error);
            }
        });
    },

    get_tag_array: function (req, res) {
        var tag_query = tag_schema.tag.find({});
        tag_query.sort({tag_name: 1});
        tag_query.exec(function (tag_error, tag_array) {
            if (tag_array && tag_array.length > 0) {
                req.session.tag_array_all = tag_array;
            } else {
                console.log(tag_array);
            }
        });
    },

    get_all: function (req, res) {
        controllers.get_store_array(req, res);
        controllers.get_product_array(req, res);
        controllers.get_media_array(req, res);
        controllers.get_industry_array(req, res);
        controllers.get_location_array(req, res);
        controllers.get_tag_array(req, res);
    },

    render_404: function (req, res) {
        controllers.get_all(req, res);
        res.render("404");
    },

    get_store_by_id: function (req, res, id_store) {
        var store_query = store_schema.store.find({_id: id_store});
        store_query.exec(function (store_error, store) {
            if (store && store.length > 0) {
                req.session.store_array = store;
            } else {
                console.log("get_store_by_id error: " + store_error);
            }
        });
    },

    find_something_from_something: function (req, res, input, result) {

        if (result == "Store._id") {
            store_schema.store.find({url: input}, function (store_error, store) {
                if (!store_error) {
                    req.session.find_result = store[0]._id;
                } else {
                    console.log(store_error);
                }
            });
        } else if (result == "Product._id") {
            product_schema.product.find({url: input}, function (product_error, product) {
                if (!product_error) {
                    req.session.find_result = product[0]._id;
                } else {
                    console.log(product_error);
                }
            });
        } else if (result == "Product._id => Product.id_store") {
            product_schema.product.find({_id: input}, function (product_error, product) {
                if (!product_error) {
                    req.session.find_result = product[0].id_store;
                } else {
                    console.log(product_error);
                }
            });
        }
    },

    get_index: function (req, res) {
        controllers.get_store_array(req, res);
        setTimeout(function () {
            res.render('index', {store_array: req.session.store_array_all});
        });
    },

    get_store_detail_url: function (req, res) {
        var url = req.params.url;
        if (url) {
            req.session.store_url_current = url;
            store_schema.store.find({url: url}, function (store_error, store_current) {
                req.session.store_current = store_current;
                var id;
                store_current.forEach(function (store) {
                    id = store._id;
                });
                if (id) {
                    var product_query = product_schema.product.find({"id_store": id});
                    product_query.sort({date: -1});
                    product_query.exec(function (product_error, product_array) {
                        if (product_array.length > 0) {
                            console.log("vô đây");
                            req.session.product_array_curent = product_array;
                            res.render('store_detail', {store_id_current: url, store_array: store_current, industry_array: req.session.industry_array_all, product_array: product_array});
                        } else {
                            console.log("không có product array");
                            res.render("store_detail", {store_id_recent: url, store_array: store_current, industry_array: req.session.industry_array_all, product_array: product_array, product_notification: "Cửa hàng này chưa có sản phẩm nào cả, vui lòng trở lại sau. :)"});
                        }
                    });
                } else {
                    console.log("hahha")
                    controllers.render_404(req, res);
                }
            });
        } else {
            console.log("186")
            res.render('store_detail', {store_array: req.session.store_current, industry_array: req.session.industry_array_all, product_array: req.session.product_array_curent});
        }
    },

    /*get_store_detail_url_nothing: function (req, res) {
     controllers.get_store_array(req, res);
     setTimeout(function () {
     console.log("bị")
     res.render('index', {store_array: req.session.store_array_all});
     })
     },*/

    get_store_detail: function (req, res) {
        controllers.get_all(req, res);
        var id_store;
        if (req.param("id")) {
            id_store = req.param("id");
        } else {
            id_store = req.session.store_id_current;
        }
        req.session.store_id_current = id_store;
        if (id_store) {
            store_schema.store.find({_id: id_store}, function (store_error, store_current) {
                req.session.store_current = store_current;
                var product_query = product_schema.product.find({"id_store": id_store});
                product_query.sort({date: -1});
                product_query.exec(function (product_error, product_array) {
                    if (product_array && product_array.length > 0) {
                        req.session.product_array_curent = product_array;
                        res.render('store_detail', {store_id_current: id_store, store_array: store_current, industry_array: req.session.industry_array_all, product_array: product_array, media_array: req.session.media_array_all});
                    } else {
                        res.render("store_detail", {store_id_recent: id_store, store_array: store_current, industry_array: req.session.industry_array_all, product_array: product_array, product_notification: "Cửa hàng này chưa có sản phẩm nào cả, vui lòng trở lại sau. :)"});
                    }
                });
            });
        } else {
            res.render('index', {store_array: req.session.store_array_all, industry_array: req.session.industry_array_all});
        }
    },

    get_insert_store: function (req, res) {
        controllers.get_all(req, res);
        setTimeout(function () {
            res.render('insert_store', {industry_array: req.session.industry_array_all, location_array: req.session.location_array_all});
        }, 20);
    },

    post_insert_store: function (req, res) {
        var id_user_facebook = "id_user_facebook";
        var store_name = req.body.txtStoreName;
        var store_name_non_accented = S(store_name).latinise().s;
        var url = controllers.slug_factory(store_name);
        var address = [];
        var city = req.body.txtCity;
        var district = req.body.optDistrict;
        var street = req.body.txtStreet;
        var room = req.body.txtRoom;
        if (room == "") {
            address.push({city: city, district: district, street: street});
        } else {
            address.push({city: city, district: district, street: street, room: room});
        }
        var latitude = req.body.txtLatitude;
        var longitude = req.body.txtLongitude;
        var phone = req.body.txtPhone;
        var description = req.body.txtDescription;
        var industry = req.body.slcIndustry;
        var hours_of_work = req.body.txtHoursOfWork;
        var website = req.body.txtWebsite;
        var fanpage = req.body.txtFanpage;
        //Lấy hình, resize và chỉnh path:
        //Path upload:
        var cover_upload_path = req.files.ulfCover.path;
        var logo_upload_path = req.files.ulfLogo.path;
        //Path save:
        var cover_save_path = "public/images/" + req.files.ulfCover.name;
        var logo_save_path = "public/images/" + req.files.ulfLogo.name;
        //Crop
        var option;
        option = {
            srcPath: cover_upload_path,
            dstPath: cover_save_path,
            width: 1100,
            height: 350,
            quality: 1,
            gravity: "Center"
        };
        im.crop(option, function (err, stdout, stderr) {
            if (err) {
                throw err
            } else {
                console.log('Resized cover successful.')
            }
        });
        option = {
            srcPath: logo_upload_path,
            dstPath: logo_save_path,
            width: 650,
            height: 500,
            quality: 1,
            gravity: "Center"
        };
        im.crop(option, function (err, stdout, stderr) {
            if (err) {
                throw err
            } else {
                console.log('Resized logo successful.')
            }
        });
        //Xử lý path save:
        cover_save_path = ".." + cover_save_path.replace("public", "");
        logo_save_path = ".." + logo_save_path.replace("public", "");
        var date = new Date();
        new store_schema.store({
            _id: null,
            id_user_facebook: id_user_facebook,
            store_name: store_name,
            store_name_non_accented: store_name_non_accented,
            url: url,
            address: address,
            latitude: latitude,
            longitude: longitude,
            phone: phone,
            description: description,
            industry: industry,
            hours_of_work: hours_of_work,
            website: website,
            fanpage: fanpage,
            cover: cover_save_path,
            logo: logo_save_path,
            date: date
        }).save(function (error) {
                if (!error) {
                    var store_query = store_schema.store.find({});
                    store_query.limit(1);
                    store_query.sort({date: -1});
                    store_query.exec(function (store_error, store) {
                            if (!store_error) {
                                req.session.store_array_current = store;
                                var id_store = store[0]._id;
                                console.log("insert thanh cong: " + store);
                                res.render("store_detail", {store_array: store/*, industry_array: req.session.industry_array_all*/, product_notification: "Cửa hàng này chưa có sản phẩm nào cả, vui lòng trở lại sau. :)"});
                            }
                            else {
                                console.log(store_error);
                            }
                        }
                    );
                }
                else {
                    console.log(error);
                }
            }
        );
    },

    get_edit_store: function (req, res) {
        controllers.get_all(req, res);
        var store_id = req.param('id');
        store_schema.store.find({_id: store_id}, function (store_error, store_array) {
            if (!store_error && store_array && store_array.length > 0) {
                product_schema.product.find({IDStore: store_id}, function (product_error, product_array) {
                    store_array.forEach(function (store) {
                        cover = store.cover;
                        logo = store.logo;
                        location_schema.location.find(function (location_error, location_array) {
                            if (!location_error && location_array.length > 0) {
                                req.session.location_array = location_array;
                                var industry_query = industry_schema.industry.find({});
                                industry_query.sort({industry_name: 1});
                                industry_query.exec(function (industry_error, industry_array) {
                                    if (industry_array && industry_array.length > 0) {
                                        res.render('edit_store', {store_array: store_array, product_array: product_array, industry_array: industry_array, location_array: location_array});
                                    } else {
                                        console.log(industry_error);
                                    }
                                });
                            }
                        });
                    });
                })
            }
        });
    },

    post_edit_store: function (req, res) {
        var store_id = req.param('id');
        var store_name = req.body.txtStoreName;
        var store_name_non_accented = S(store_name).latinise().s;
        var address = [];
        var city = req.body.txtCity;
        var district = req.body.optDistrict;
        var street = req.body.txtStreet;
        var room = req.body.txtRoom;
        if (room) {
            address.push({"city": city, "district": district, "street": street, "room": room});
        } else {
            address.push({"city": city, "district": district, "street": street});
        }
        var latitude = req.body.txtLatitude;
        var longitude = req.body.txtLongitude;
        var phone = req.body.txtPhone;
        var description = req.body.txtDescription;
        var industry = req.body.slcIndustry;
        var hours_of_work = req.body.txtHoursOfWork;
        var website = req.body.txtWebsite;
        var fanpage = req.body.txtFanpage;
        var im = require('imagemagick');
        //Cover:
        var cover_new = cover;
        if (typeof req.files.ulfCover != 'undefined') {
            var cover_upload_path = req.files.ulfCover.path;
            var cover_save_path = "public/images/" + req.files.ulfCover.name;
            var option = {
                srcPath: cover_upload_path,
                dstPath: cover_save_path,
                width: 1100,
                height: 400,
                quality: 1,
                gravity: "Center"
            };
            im.crop(option, function (err, stdout, stderr) {
                if (err) throw err;
            });
            cover_save_path = ".." + req.files.ulfCover.path.replace("public", "");
            cover_new = cover_save_path;
        }
        //Logo:
        var logo_new = logo;
        if (typeof req.files.ulfLogo != 'undefined') {
            var logo_upload_path = req.files.ulfLogo.path;
            var logo_save_path = "public/images/" + req.files.ulfLogo.name;
            im.resize({
                srcPath: logo_upload_path,
                dstPath: logo_save_path,
                width: 500
            }, function (err, stdout, stderr) {
                if (err) throw err;
            });
            logo_save_path = ".." + req.files.ulfLogo.path.replace("public", "");
            logo_new = logo_save_path;
        }

        store_schema.store.findByIdAndUpdate({_id: store_id}, {$set: {
            store_name: store_name,
            store_name_non_accented: store_name_non_accented,
            address: address,
            latitude: latitude,
            longitude: longitude,
            phone: phone,
            description: description,
            industry: industry,
            hours_of_work: hours_of_work,
            cover: cover_new,
            logo: logo_new,
            website: website,
            fanpage: fanpage
        }}, function (error, result) {
            if (!error && result) {
                var store_query = store_schema.store.find({"_id": store_id});
                store_query.limit(8);
                store_query.sort({date: -1});
                store_query.exec(function (store_error, store_array) {
                    if (store_array && store_array.length > 0) {
                        var product_query = product_schema.product.find({"id_store": store_id});
                        product_query.limit(10);
                        product_query.sort({date: -1});
                        product_query.exec(function (product_error, product_array) {
                            if (product_array && product_array.length > 0) {
                                res.render('store_detail', {store_id: store_id, store_array: store_array, industry_array: req.session.industry_array, product_array: product_array, media_array: req.session.media_array_all});
                            } else {
                                res.render("store_detail", {store_id: store_id, industry_array: req.session.industry_array, store_array: store_array, product_array: product_array, product_notification: "Không có sản phẩm tồn tại."});
                            }
                        });
                    } else {
                        console.log(store_error);
                    }
                });
            } else {
                console.log(error);
            }
        });
    },

    delete_store: function (req, res) {
        //Convert to ObjectId:
        var id = mongoose.Types.ObjectId(req.params.id_store);
        store_schema.store.findByIdAndRemove({_id: id}, function (remove_store_error) {
            if (!remove_store_error) {
                product_schema.product.find({id_store: req.params.id_store}, function (product_error, product_array) {
                    product_array.forEach(function (product) {
                        media_schema.media.remove({product_id: product._id}, function (remove_media_error) {
                            if (!remove_media_error) {
                                product_schema.product.remove({id_store: req.params.id_store}, function (remove_product_error) {
                                    return res.send("Xóa store và các thứ liên quan (product, media) thành công.");
                                });
                            }
                        });
                    });
                });
            } else {
                console.log(remove_store_error);
            }
        });
    },

    get_product_detail_url: function (req, res) {
        controllers.get_all(req, res);
        var url = req.param("url");
        if (url) {
            product_schema.product.find({url: url}, function (product_error, product_array) {
                if (product_array && product_array.length > 0) {
                    req.session.product_array = product_array;
                    req.session.product_id_current = product_array[0]._id;
                    var media_query = media_schema.media.find({product_id: product_array[0]._id});
                    media_query.sort({media_date: -1});
                    media_query.exec(function (media_error, media_array) {
                        console.log(media_array);
                        if (media_array && media_array.length > 0) {
                            req.session.media_array = media_array;
                            res.render('product_detail', {product_array: product_array, industry_array: req.session.industry_array, media_array: media_array});
                        } else {
                            res.render('product_detail', {product_array: product_array, industry_array: req.session.industry_array, media_notification: "Không có"});
                        }
                    });
                } else {
                    res.render('store_detail', {store_array: req.session.store_current, product_array: req.session.product_array_curent, industry_array: req.session.industry_array});
                }
            })
        } else {
            //sút ra index hay đâu đó
        }

    },

    get_product_detail: function (req, res) {
        controllers.get_all(req, res);
        var id_product;
        if (req.param('id')) {
            id_product = req.param('id');
        } else {
            id_product = req.session.product_id_current;
        }
        req.session.product_id_current = id_product;
        product_schema.product.find({_id: id_product}, function (product_error, product_array) {
            if (product_array && product_array.length > 0) {
                req.session.product_array = product_array;
                var media_query = media_schema.media.find({product_id: id_product});
                media_query.sort({media_date: -1});
                media_query.exec(function (media_error, media_array) {
                    //console.log(media_array);
                    if (media_array && media_array.length > 0) {
                        req.session.media_array = media_array;
                        res.render('product_detail', {product_array: product_array, industry_array: req.session.industry_array, media_array: media_array});
                    } else {
                        res.render('product_detail', {product_array: product_array, industry_array: req.session.industry_array, media_notification: "Không có"});
                    }
                });
            } else {
                res.render('store_detail', {store_array: req.session.store_current, product_array: req.session.product_array_curent, industry_array: req.session.industry_array});
            }
        })
    },

    get_insert_product: function (req, res) {
        controllers.get_all(req, res);
        var store_id = req.param("id");
        if (!req.param("id")) {
            store_id = req.session.store_id_recent;
        }
        if (store_id) {
            req.session.store_id_recent = store_id;
            product_schema.product.find({id_store: store_id}, function (product_error, product_array) {
                res.render('insert_product', {product_array: product_array, industry_array: req.session.industry_array, store_id: store_id, insert_product_notification: "Thêm sản phẩm thành công."});
            });
        } else {
            res.render('index', {industry_array: req.session.industry_array});
        }
    },

    get_insert_product_url: function (req, res) {
        var x = controllers.find_something_from_something(req, res, req.params.store_url, "Store._id");
        setTimeout(function () {
            console.log(req.session.store_id);
        })
    },

    post_insert_product_url: function (req, res) {
        var x = controllers.find_something_from_something(req, res, req.params.store_url, "Store._id");
        setTimeout(function () {
            console.log(req.session.store_id);
        })
    },

    post_insert_product: function (req, res) {
        var store_id;
        if (req.param("id") == "") {
            store_id = req.param('id');
        } else {
            store_id = req.session.store_id_recent;
        }
        var product_name = req.body.txtProductName;
        var product_name_non_accented = S(product_name).latinise().s;
        var url = controllers.slug_factory(product_name);
        var price = req.body.txtPrice;
        //Tags:
        var string_tags = req.body.txtTags;
        string_tags = string_tags.toLowerCase();
        /*console.log(string_tags);*/
        var tags = string_tags.split(",");
        for (i = 0; i < tags.length; i++) {
            tags[i] = tags[i].trim();
            /*console.log(tags[i]);*/
        }
        /*console.log(tags);*/
        var polymeric = false;
        tag_schema.tag.find(function (tag_error, tag_array) {
            if (tag_error) {
                throw tag_error;
            } else {
                for (i = 0; i < tags.length; i++) {
                    tags[i] = tags[i].trim();
                    tag_array.forEach(function (tag) {
                        if (tag.tag_name == tags[i]) {
                            polymeric = true;
                            /*console.log("trùng thằng " + tags[i]);*/
                            return true;
                        }
                    });
                    if (polymeric == false) {
                        new tag_schema.tag({
                            _id: null,
                            tag_name: tags[i]
                        }).save(function (insert_tag_error) {
                                if (insert_tag_error) {
                                    console.log(insert_tag_error);
                                }
                            });
                    } else {
                        polymeric = false;
                    }
                }
            }
        });

        var description = req.body.txtDescription;
        //Product image:
        var product_image;
        if (!req.files.ulfProductImage) {
            product_image = product_image_when_edit_product;
        } else {
            var product_image_upload_path = req.files.ulfProductImage.path;
            var product_image_save_path = "public/images/" + req.files.ulfProductImage.name;
            var im = require('imagemagick');
            var option = {
                srcPath: product_image_upload_path,
                dstPath: product_image_save_path,
                width: req.files.ulfProductImage.width,
                //height: 500,
                quality: 0.5
                //gravity: "Center"
            };
            im.resize(option, function (err, stdout, stderr) {
                if (!err) {
                    console.log("Resize with option success.")
                }
            });
            product_image_save_path = ".." + product_image_save_path.replace("public", "");
            product_image = product_image_save_path;
        }
        var status = true;
        var date = new Date();
        new product_schema.product({
            _id: null,
            id_store: store_id,
            product_name: product_name,
            product_name_non_accented: product_name_non_accented,
            url: url,
            price: price,
            tags: tags,
            description: description,
            product_image: product_image,
            status: status,
            rating: [],
            date: date
        }).save(function (save_error) {
                if (!save_error) {

                    var product_media = product_schema.product.find({id_store: store_id});
                    product_media.sort({date: -1});
                    product_media.exec(function (product_error, product_array) {
                        if (product_array && product_array.length > 0) {
                            /*setTimeout(function () {*/
                            console.log(req.session.store_current);
                            res.render("store_detail", {store_id: store_id, store_array: req.session.store_current, product_array: product_array, industry_array: req.session.industry_array});
                            /*}, 500);*/
                        } else {
                            console.log(product_error);
                        }
                    });
                } else {
                    console.log(save_error);
                }
            });
    },

    get_edit_product: function (req, res) {
        controllers.get_all(req, res);
        if (req.param('id')) {
            var id = req.param('id');
            product_schema.product.find({_id: id}, function (product_error, product_array) {
                if (product_array && product_array.length > 0) {
                    product_array.forEach(function (product) {
                        product_image_when_edit_product = product.product_image;
                    });
                    res.render('edit_product', {product_array: product_array, industry_array: req.session.industry_array});
                } else {
                    console.log(product_error);
                }
            });
        } else {
            res.render('index');
        }
    },

    post_edit_product: function (req, res) {
        var product_id = req.param('id');
        var product_name = req.body.txtProductName;
        var product_name_non_accented = S(product_name).latinise().s;
        var price = req.body.txtPrice;
        //Tags
        var strTags = req.body.txtTags;
        var tags = strTags.split(",");
        for (i = 0; i < tags.length; i++) {
            tags[i] = tags[i].trim().toLowerCase();
        }
        var description = req.body.txtDescription;
        //Product image:
        var product_image;
        if (!req.files.ulfProductImage) {
            product_image = product_image_when_edit_product;
        } else {
            var product_image_upload_path = req.files.ulfProductImage.path;
            var product_image_save_path = "public/images/" + req.files.ulfProductImage.name;
            var im = require('imagemagick');
            var option = {
                srcPath: product_image_upload_path,
                dstPath: product_image_save_path,
                width: req.files.ulfProductImage.width,
                //height: 500,
                quality: 0.5
                //gravity: "Center"
            };
            im.resize(option, function (err, stdout, stderr) {
                if (!err) {
                    console.log("Edit product, resize image success.")
                }
            });
            product_image_save_path = ".." + product_image_save_path.replace("public", "");
            product_image = product_image_save_path;
        }
        product_schema.product.findByIdAndUpdate({_id: product_id}, {$set: {product_name: product_name, product_name_non_accented: product_name_non_accented, price: price, description: description, product_image: product_image, tags: tags}}, function (error, result) {
            if (!error && result) {
                controllers.find_something_from_something(req, res, product_id, "Product._id => Product.id_store");
                setTimeout(function () {
                    controllers.get_store_by_id(req, res, req.session.find_result);
                    console.log("store_id nè : " + req.session.find_result);
                    var product_query = product_schema.product.find({id_store: req.session.find_result});
                    product_query.sort({date: -1});
                    product_query.exec(function (product_error, product_array) {
                        if (product_array && product_array.length > 0) {
                            req.session.product_array = product_array;
                            setTimeout(function () {
                                //console.log("store array" + req.session.store_array);
                                res.render('store_detail', {product_array: product_array, industry_array: req.session.industry_array, store_id: req.session.store_id_current, store_array: req.session.store_array});
                            })
                        } else {
                            console.log("post_edit_product: " + product_error);
                            res.render('index');
                        }
                    });
                });
            } else {
                console.log(error);
            }
        });
    },

    get_insert_media: function (req, res) {
        controllers.get_all(req, res);
        res.render('insert_media', {industry_array: req.session.industry_array});
    },

    post_insert_media: function (req, res) {
        var id;
        var id_product;
        if (req.param('id')) {
            id_product = req.param('id');
        } else {
            id_product = req.session.product_id_current;
        }
        if (id_product) {
            var product_id = id_product;
            var media_name = req.body.txtMediaName;
            var media_url;
            if (req.body.txtMediaUrl != "" && typeof req.files.ulfMediaUrl == "undefined") {
                media_url = req.body.txtMediaUrl;
            } else {
                var media_upload_path = req.files.ulfMediaUrl.path;
                var media_save_path = "public/images/" + req.files.ulfMediaUrl.name;
                var option = {
                    srcPath: media_upload_path,
                    dstPath: media_save_path,
                    width: 600
                };
                im.resize(option, function (err, stdout, stderr) {
                    if (err) throw err;
                    console.log('Resized media successful.');
                });
                media_url = ".." + media_save_path.replace("public", "")
            }
            new media_schema.media({
                _id: null,
                product_id: product_id,
                media_name: media_name,
                media_type: req.body.grpType,
                media_url: media_url,
                media_date: new Date()
            }).save(function (error) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(req.session.store_id_current);
                        product_schema.product.find({_id: req.session.product_id_current}, function (product_error, product) {
                            var media_query = media_schema.media.find({product_id: id_product});
                            media_query.sort({media_date: -1});
                            media_query.exec(function (media_error, media_array) {
                                if (media_array && media_array.length > 0) {
                                    req.session.media_array = media_array;
                                    res.render('product_detail', {product_array: product, industry_array: req.session.industry_array_all, store_id: req.session.store_id_current, store_array: req.session.store_current, product_id: req.session.product_id_current, media_array: media_array});
                                } else {
                                    console.log(media_error);
                                }
                            });
                        });
                    }
                })
        } else {
            console.log("Không có id_product.");
            res.render('index', {store_array: req.session.store_array_all});
        }
    },

    delete_media: function (req, res) {
        media_schema.media.findByIdAndRemove(req.params.id_media, function (remove_error) {
            if (!remove_error) {
                //req.session.delete_media_flag = true;
                return res.send('');
            } else {
                console.log(remove_error);
            }
        });
    },

    get_edit_media: function (req, res) {
        controllers.get_all(req, res);
        var id;
        if (req.param('id')) {
            id = req.param('id');
        } else {
            id = req.session.media_id_current;
        }
        media_schema.media.find({_id: id}, function (media_error, media_array) {
            res.render('edit_media', {media_array: media_array});
        });
    },

    post_edit_media: function (req, res) {
        var id = req.param('id');
        var media_name = req.body.txtMediaName;
        var media_url;
        if (typeof req.files.ulfMediaUrl == "undefined") {
            media_url = req.body.txtMediaUrl;
        } else {
            var media_upload_path = req.files.ulfMediaUrl.path;
            var media_save_path = "public/images/" + req.files.ulfMediaUrl.name;
            var option = {
                srcPath: media_upload_path,
                dstPath: media_save_path,
                width: 600
            };
            im.resize(option, function (err, stdout, stderr) {
                if (err) throw err;
                console.log('Resized media successful.');
            });
            media_url = ".." + media_save_path.replace("public", "")
        }
        var media_type = req.body.grpType;
        media_schema.media.findByIdAndUpdate(id, {
            media_name: media_name,
            media_type: media_type,
            media_url: media_url
        }, function (error, result) {
            if (result) { //sort -1
                product_schema.product.find({_id: req.session.product_id_current}, function (product_error, product_array) {
                    if (product_array.length > 0) {
                        var media_query = media_schema.media.find({product_id: req.session.product_id_current});
                        media_query.sort({media_date: -1});
                        media_query.exec(function (media_error, media_array) {
                            if (media_array && media_array.length > 0) {
                                res.render('product_detail', {product_array: product_array, media_array: media_array, industry_array: req.session.industry_array});
                            } else {
                                console.log(media_error);
                            }
                        });
                    } else {
                        console.log(product_array);
                    }
                })
            }
        });
    },

    get_insert_industry: function (req, res) {
        var industry_query = industry_schema.industry.find({});
        industry_query.sort({industry_name: 1});
        industry_query.exec(function (industry_error, industry_array) {
            if (industry_array && industry_array.length > 0) {
                req.session.industry_array = industry_array;
                res.render('insert_industry', {industry_array: req.session.industry_array});
            } else {
                console.log(industry_error);
            }
        });
    },

    post_insert_industry: function (req, res) {
        var industry_name = req.body.txtIndustryName;
        //var industry_image = req.body.txtIndustryImage;
        new industry_schema.industry({
            _id: null,
            industry_name: industry_name
            //industry_image: industry_image
        }).save(function (save_error) {
                if (!save_error) {
                    controllers.get_industry_array(req, res);
                    res.render('industry', {industry_array: req.session.industry_array_all, store_array: req.session.store_array, industry_notification: "Không có store nào."});
                } else {
                    console.log(save_error);
                }
            });
    },

    get_industry: function (req, res) {
        controllers.get_industry_array(req, res);
        setTimeout(function () {
            var industry_name = req.param('type');
            if (!req.param('type')) {
                res.render('industry', {store_array: req.session.store_array_all, industry_array: req.session.industry_array_all, industry_notification: "Không có store nào."});
            } else {
                store_schema.store.find({industry: industry_name}, function (store_error, store_array) {
                    if (store_array.length > 0) {
                        res.render('industry', {industry_array: req.session.industry_array_all, store_array: store_array});
                    } else {
                        res.render('industry', {industry_array: req.session.industry_array_all, store_array: store_array, industry_notification: "Không có store nào."});
                    }
                });
            }
        }, 200);
    },

    get_search_store: function (req, res) {
        /*controllers.get_all(req, res);
         if (req.session.header == true) {
         res.render('search_store', {store_array: req.session.store_array_header_search, industry_array: req.session.industry_array, location_array: req.session.location_array});
         } else if (req.session.header == false) {
         res.render('search_store', {store_array: req.session.store_array_header_search, industry_array: req.session.industry_array, location_array: req.session.location_array, search_notification: "Không có cửa hàng nào cả. :("});
         }*/
        location_schema.location.find(function (location_error, location_array) {
            if (!location_error && location_array.length > 0) {
                req.session.location_array = location_array;
                var industry_query = industry_schema.industry.find({});
                industry_query.sort({industry_name: 1});
                industry_query.exec(function (industry_error, industry_array) {
                    if (industry_array && industry_array.length > 0) {
                        req.session.industry_array = industry_array;
                        res.render('search_store', {industry_array: req.session.industry_array, location_array: location_array});
                    } else {
                        console.log(industry_error);
                    }
                });
            }
        });
    },

    post_search_store: function (req, res) {
        controllers.get_all(req, res);
        var key = req.body.txtTextSearch;
        var district = req.body.optDistrict;
        var store_query;
        if (key) { //tìm tất cả các store
            console.log("1");
            if (district == "Tất Cả Các Quận") { //nếu không có quận
                console.log("1 nếu không chọn quận (tức là all)");
                store_query = store_schema.store.find({$or: [
                    {store_name: {$regex: key, $options: 'i'}},
                    {store_name_non_accented: {$regex: key, $options: 'i'}}
                ]});
            } else { //nếu có quận
                console.log("1 có chọn quận");
                store_query = store_schema.store.find({
                    $and: [
                        {$or: [
                            {store_name: {$regex: key, $options: 'i'}},
                            {store_name_non_accented: {$regex: key, $options: 'i'}}
                        ]},
                        {address: {$elemMatch: {district: district}}}
                    ]
                });
            }
            store_query.sort({date: -1});
            store_query.exec(function (store_error, store_array) {
                if (store_array && store_array.length > 0) {
                    console.log("1 - có");
                    res.render('search_store', {store_array: store_array, industry_array: req.session.industry_array, location_array: req.session.location_array, search_contain: key, search_district: district});
                } else {
                    console.log("1 - không có");
                    res.render('search_store', {store_array: store_array, industry_array: req.session.industry_array, location_array: req.session.location_array, search_contain: key, search_district: district, search_notification: "Không có cửa hàng nào cả. :("});
                }
            });
        } else { //tìm store, không có keyword
            console.log("2");
            if (district == "Tất Cả Các Quận") { //nếu không có quận
                store_query = store_schema.store.find({});
            } else {
                store_query = store_schema.store.find({address: {$elemMatch: {district: district}}});
            }
            store_query.sort({date: -1});
            store_query.exec(function (store_error, store_array) {
                if (store_array && store_array.length > 0) {
                    console.log("1 - có");
                    res.render('search_store', {store_array: store_array, industry_array: req.session.industry_array, location_array: req.session.location_array});
                } else if (store_array.length == 0) {
                    console.log("1 - không có");
                    res.render('search_store', {store_array: store_array, industry_array: req.session.industry_array, location_array: req.session.location_array, search_notification: "Không có cửa hàng nào cả. :("});
                }
            });
        }
    },

    get_search_product: function (req, res) {
        controllers.get_product_array(req, res);
        location_schema.location.find(function (location_error, location_array) {
            if (!location_error && location_array.length > 0) {
                req.session.location_array = location_array;
                var industry_query = industry_schema.industry.find({});
                industry_query.sort({industry_name: 1});
                industry_query.exec(function (industry_error, industry_array) {
                    if (industry_array && industry_array.length > 0) {
                        req.session.industry_array = industry_array;
                        res.render('search_product', {industry_array: req.session.industry_array, location_array: location_array});
                    } else {
                        console.log(industry_error);
                    }
                });
            }
        });
    },

    post_search_product: function (req, res) {
        var key = req.body.txtTextSearchProduct;
        var district = req.body.optDistrict;
        var store_query;
        var product_query;
        if (key) { //có key
            console.log("Có key.");
            if (district == "Tất Cả Các Quận") {
                product_query = product_schema.product.find({$or: [
                    {product_name: {$regex: key, $options: 'i'}},
                    {product_name_non_accented: {$regex: key, $options: 'i'}}
                ]});
                //Query này ok.
                product_query.sort({date: -1});
                product_query.exec(function (product_error, product_array) {
                    if (product_array && product_array.length > 0) {
                        console.log("1 - có");
                        res.render('search_product', {product_array: product_array, industry_array: req.session.industry_array, location_array: req.session.location_array, search_contain: key, search_district: district});
                    } else if (product_array.length == 0) {
                        console.log("1 - không có");
                        res.render('search_product', {product_array: product_array, industry_array: req.session.industry_array, location_array: req.session.location_array, search_notification: "Không có cửa hàng nào cả. :("});
                    }
                });
            } else {
                var product_array_render;
                store_query = store_schema.store.find({address: {$elemMatch: {district: district}}}); //Tìm store có district giống với lựa chọn.
                store_query.sort({date: -1}); //Sort.
                store_query.exec(function (store_error, store_array) { //Exec.
                    console.log("các store chứa product đó là " + store_array);
                    store_array.forEach(function (store) {
                        console.log(store._id)
                        var product_query1 = product_schema.product.find({
                            $or: [
                                {product_name: {$regex: key, $options: "i"}},
                                {product_name_non_accented: {$regex: key, $options: "i"}}
                            ]});
                        //product_query1.sort({date: -1});
                        product_query1.exec(function (product_error, product_array) {
                            if (product_array_render == null) {
                                product_array_render = product_array;
                            } else {
                                product_array_render = product_array_render.concat(product_array);
                            }
                        });
                        console.log(product_array_render)
                    });
                    console.log("chạy xong luôn nha");
                    setTimeout(function () {
                        console.log("time out");
                        if (product_array_render && product_array_render.length > 0) {
                            res.render('search_product', {product_array: product_array_render, industry_array: req.session.industry_array, location_array: req.session.location_array, search_contain: key, search_district: district});
                        } else {
                            console.log("4-2 Không có.");
                            res.render('search_product', {product_array: req.session.product_array_all, industry_array: req.session.industry_array, location_array: req.session.location_array, search_contain: key, search_district: district, search_notification: "Không có cửa hàng nào cả. :("});
                        }

                    }, 50);
                });
            }
        } else { //Không có key.
            console.log(key + district);
            console.log("4-2");
            if (district != "Tất Cả Các Quận") {
                store_query = store_schema.store.find({address: {$elemMatch: {district: district}}});
                store_query.sort({date: -1});
                store_query.exec(function (store_error, store_array) {
                    var product_array_render;
                    var count_store = 0;
                    store_array.forEach(function (store) {
                        count_store++;
                        var product_query = product_schema.product.find({
                            $and: [
                                {id_store: store._id},
                                {$or: [
                                    {product_name: {$regex: key, $options: 'i'}},
                                    {product_name_non_accented: {$regex: key, $options: 'i'}}
                                ]}
                            ]
                        });
                        product_query.sort({date: -1});
                        product_query.exec(function (product_error, product_array) {
                            console.log(product_array);
                            if (product_array_render == null) {
                                product_array_render = product_array;
                            } else {
                                product_array_render = product_array_render.concat(product_array);
                            }
                        });
                    });
                    setTimeout(function () {
                        console.log(product_array_render);
                        if (product_array_render && product_array_render.length > 0) {
                            res.render('search_product', {product_array: product_array_render, location_array: req.session.location_array});
                        } else {
                            console.log("4-2 Không có.");
                            res.render('search_product', {product_array: product_array_render, location_array: req.session.location_array, search_notification: "Không có mặt hàng nào cả. :("});
                        }
                    }, 20);
                });
            } else {

                console.log("Đây nè.");
                res.render('search_product', {product_array: req.session.product_array_all, location_array: req.session.location_array});
            }
        }
    },

    post_search_product_ajax: function (req, res) {
        var key = req.body.txtTextSearchProduct;
        var district = req.body.optDistrict;

        if (district == "Tất Cả Các Quận") {
            if (key) {

            } else if (!key) {

            }
        } else if (district != "Tất Cả Các Quận") {
            if (key) {

            } else if (!key) {

            }
        }


    },

    post_search_tags: function (req, res) {
        var tag = req.body.txtTextSearchTag;
        console.log(tag);
        if (tag) {
            product_schema.product.find({tags: {$all: tag}}, function (product_error, product_array) {
                if (product_array && product_array.length > 0) {
                    res.render('tags', {product_array: product_array, tag_array: req.session.tag_array_all});
                } else {
                    product_schema.product.find(function (product_error, product_array) {
                        res.render('tags', {product_array: product_array, tag_array: req.session.tag_array_all, tags_notification: "Không có sản phẩm."});
                    })
                }
            });
        } else {
            console.log("Kaboom! Không có tag từ txtTextSearchTag nên lỗi.")
        }
    },

    ajax_get_search_tags: function (req, res) {
        var tag = req.params.tag;
        //console.log("nguyên khúc: " + tag);
        tag = tag.split(",");
        var product_array_render;
        var product_query = product_schema.product.find();

        if (tag) {
            for (i = 0; i < tag.length; i++) {
                //console.log("từng cục: " + tag[i]);
                product_query.find({tags: {$all: [tag[i]]}});
                product_query.sort({date: -1});
                product_query.exec(function (product_error, product_array) {
                    if (product_array && product_array.length > 0) {
                        //console.log("product_array: " + product_array);
                        if (product_array_render == null) {
                            product_array_render = product_array;
                            //console.log("chưa có gì: " + product_array_render);
                        } else {
                            product_array_render = product_array_render.concat(product_array);
                            //console.log("concat nè: " + product_array_render);
                        }
                    } else {
                        /*product_schema.product.find(function (product_error, product_array) {
                         res.send("Không có sản phẩm.");
                         })*/
                    }
                });
            }
            setTimeout(function () {
                if (product_array_render != null) {
                    console.log(" hiện tại nó như này: " + product_array_render + " có " + product_array_render.length + " thằng");
                    if (product_array_render.length > 1) {
                        for (i = 0; i < product_array_render.length; i++) {
                            for (j = i + 1; j < product_array_render.length; j++) {
                                if (product_array_render[i].equals(product_array_render[j])) {
                                    console.log("thịt thằng: " + product_array_render[j].product_name + " số " + j);
                                    product_array_render.splice(j, 1);
                                    i = 0;
                                    j = 0;
                                }
                            }
                        }
                    }
                    res.send(product_array_render);
                } else {
                    res.send("không có")
                }
            }, 20);
        }
        else {
            console.log("Bên tags.ejs không có chọn gì cả.")
        }
    },

    ajax_get_search_tags_nothing: function (req, res) {
        //nothing to do hrere
    },

    header_search: function (req, res) {
        var key = req.params.keyword;
        var store_query = store_schema.store.find({$or: [
            {store_name: {$regex: key, $options: 'i'}},
            {store_name_non_accented: {$regex: key, $options: 'i'}}
        ]});
        store_query.sort({date: -1});
        store_query.exec(function (store_error, store_array) {
            if (store_array && store_array.length > 0) {
                req.session.store_array = store_array;
                req.session.header = true;
                req.session.store_array_header_search = store_array;
                res.render('search', {store_array: store_array, industry_array: req.session.industry_array, location_array: req.session.location_array});
            } else {
                req.session.header = false;
                res.render('search', {store_array: store_array, industry_array: req.session.industry_array, location_array: req.session.location_array, search_notification: "Không có cửa hàng nào cả. :("});
            }
        });
    },

    get_tag: function (req, res) {
        controllers.get_all(req, res);
        setTimeout(function () {
            var tag = req.param("tag");
            if (tag) {
                product_schema.product.find({tags: {$all: [tag]}}, function (product_error, product_array) {
                    if (product_array && product_array.length > 0) {
                        res.render('tags', {product_array: product_array, tag_array: req.session.tag_array_all});
                    } else {
                        res.render('tags', {product_array: req.session.product_array_all, tag_array: req.session.tag_array_all, tags_notification: "Không có sản phẩm."});
                    }
                });
            } else {
                res.render('tags', {product_array: req.session.product_array_all, tag_array: req.session.tag_array_all});
            }
        }, 200);
    },

    get_location: function (req, res) {
        controllers.get_all(req, res);
        location_schema.location.find(function (location_error, location_array) {
            if (location_array && location_array.length > 0 && !location_error) {
                req.session.location_array = location_array;
                res.render('location', {location_array: location_array})
            }
        })
    },

    get_insert_location: function (req, res) {
        controllers.get_all(req, res);
        res.render('insert_location');
    },

    post_insert_location: function (req, res) {
        var city = req.body.txtCity;
        var string_district = req.body.txtDistrict;
        var districts = string_district.split(",");
        for (i = 0; i < districts.length; i++) {
            districts[i] = districts[i].trim();
        }
        new location_schema.location({
            _id: null,
            city: city,
            district: districts
        }).save(function (save_error) {
                if (!save_error) {
                    location_schema.location.find(function (location_error, location_array) {
                        if (location_array && location_array.length > 0 && !location_error) {
                            req.session.location_array = location_array;
                            res.render('location', {location_array: req.session.location_array});
                        } else {
                            console.log(location_error);
                        }
                    });
                } else {
                    console.log(save_error);
                }
            });
    },

    get_edit_location: function (req, res) {
        controllers.get_all(req, res);
        var id = req.param('id');
        req.session.location_id_recent = id;
        location_schema.location.find({_id: id}, function (location_error, location_array) {
            res.render('edit_location', {location_array: location_array});
        });
    },

    post_edit_location: function (req, res) {
        var id = req.session.location_id_recent;
        var string_district = req.body.txtDistrict;
        var districts = string_district.split(",");
        for (i = 0; i < districts.length; i++) {
            districts[i] = districts[i].trim();
        }
        location_schema.location.update({_id: id}, {$pushAll: {district: districts}}, {upsert: true}, function (update_error, update_result) {
            if (!update_error && update_result) {
                location_schema.location.find(function (location_error, location_array) {
                    if (location_array && location_array.length > 0 && !location_error) {
                        req.session.location_array = location_array;
                        res.render('location', {location_array: location_array})
                    }
                })
            }
        });
    },

    get_delete_location: function (req, res) {
        controllers.get_all(req, res);
        var district_param = req.param('district');
        location_schema.location.update({district: {$in: [district_param]}}, {$pull: {'district': district_param}}, function (update_error, update_result) {
            if (!update_error && update_result) {
                location_schema.location.find(function (location_error, location_array) {
                    if (location_array && location_array.length > 0 && !location_error) {
                        req.session.location_array = location_array;
                        res.render('location', {location_array: location_array})
                    }
                })
            }
        })
    },

    delete_product: function (req, res) {
        console.log(req.params.id_product);
        product_schema.product.findByIdAndRemove(req.params.id_product, function (remove_product_error) {
            if (!remove_product_error) {
                //Xóa luôn media của product đó.
                media_schema.media.remove({product_id: req.params.id_product}, function (remove_media_error) {
                    if (!remove_media_error) {
                        console.log("xóa media thành công");
                        return res.send(req.session.current_store_url);
                    } else {
                        console.log(remove_media_error);
                    }
                });
            } else {
                console.log(remove_product_error);
            }
        });
    },

    get_test: function (req, res) {
        res.render('test')
    },

    upload_image_ajax: function (req, res) {
        var save_path = ".." + req.files.txtImageBrowse.path.replace("public", "");
        res.send(save_path);
    },

    get_comming: function (req, res) {
        res.render('comming', {notifications: " Chua lam sao co!"});
    }
};

module.exports = function (router) {
    //comming
    router.get('/comming', controllers.get_comming);

    //index
    router.get('/', controllers.get_index);

    //--------------------STORE--------------------
    router.get('/store_detail', controllers.get_store_detail); // hết dùng
    router.get('/store/:url', controllers.get_store_detail_url); //vào với friendly url
    router.get('/store/', controllers.get_index); //phòng khi vào mà không có url
    //store insert
    router.get('/insert_store', controllers.get_insert_store); //insert store
    router.get('/add_store', controllers.get_insert_store); //tương tư cái ở trên
    router.post('/insert_store', controllers.post_insert_store); //
    router.post('/add_store', controllers.post_insert_store); //
    //store delete
    router.delete('/delete/store/:id_store', controllers.delete_store);
    //store edit
    router.get('/edit_store', controllers.get_edit_store);
    router.post('/edit_store', controllers.post_edit_store);

    //--------------------PRODUCT--------------------
    router.get('/product_detail', controllers.get_product_detail);
    router.get('/product/:url', controllers.get_product_detail_url);
    //product insert
    router.get('/insert_product', controllers.get_insert_product);
    router.get('/store/:store_url/add_product', controllers.get_insert_product_url);
    router.post('/store/:store_url/add_product', controllers.post_insert_product_url);
    /*router.get('/store/insert_product', controllers.get_insert_product);*/
    router.post('/insert_product', controllers.post_insert_product);
    //product delete
    router.delete('/delete/product/:id_product', controllers.delete_product);
    //product edit
    router.get('/edit_product', controllers.get_edit_product);
    //router.get('/product/:product_url/edit', controllers.get_edit_product_url);
    router.post('/edit_product', controllers.post_edit_product);
    //router.post('/product/:product_url/edit', controllers.post_edit_product_url);

    //--------------------MEDIA--------------------
    //insert media in product
    router.get('/insert_media', controllers.get_insert_media);
    router.post('/insert_media', controllers.post_insert_media);
    //delete media in product
    router.delete('/delete/media/:id_media', controllers.delete_media);
    //edit media in product
    router.get('/edit_media', controllers.get_edit_media);
    router.post('/edit_media', controllers.post_edit_media);

    //industry
    router.get('/industry', controllers.get_industry);
    //insert industry
    router.post('/industry', controllers.post_insert_industry);

    //--------------------SEARCH--------------------
    router.get('/search_store', controllers.get_search_store);
    router.post('/search_store', controllers.post_search_store);
    //search_product
    router.get('/search_product', controllers.get_search_product);
    router.post('/search_product', controllers.post_search_product);
    router.get('/search/product/:district/', controllers.post_search_product_ajax);
    //search_tags
    //router.get('/search_tags', controllers.get_search_tags);
    //router.post('/search_tags', controllers.post_search_tags); //Hết dùng.
    router.get('/search/tags/:tag', controllers.ajax_get_search_tags);
    router.get('/search/tags/', controllers.ajax_get_search_tags_nothing);
    //search_header
    router.post('/header/search/:keyword', controllers.header_search);

    //tags
    router.get('/tags', controllers.get_tag);
    router.post('/tags', controllers.post_search_tags);

    //location
    router.get('/location', controllers.get_location);
    //insert_location
    router.get('/insert_location', controllers.get_insert_location);
    router.post('/insert_location', controllers.post_insert_location);
    //edit_location
    router.get('/edit_location', controllers.get_edit_location);
    router.post('/edit_location', controllers.post_edit_location);

    //test
    router.get('/test', controllers.get_test);
    router.post('/upload_image_ajax', controllers.upload_image_ajax);
    return router;
};