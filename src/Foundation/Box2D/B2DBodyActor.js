CAAT.Module({
    defines:"CAAT.Foundation.Box2D.B2DBodyActor",
    depends:[
        "CAAT.Foundation.Actor"
    ],
    aliases : ["CAAT.B2DBodyActor"],
    extendsClass:"CAAT.Foundation.Actor",
    extendsWith:function () {

        CAAT.PMR = 64;
        /**
         * As Eemeli Kelokorpi suggested,
         * @param set
         * @param director
         * @param world
         */
        CAAT.enableBox2DDebug = function (set, director, world, scale) {

            if (set) {
                var debugDraw = new Box2D.Dynamics.b2DebugDraw();
                try {
                    debugDraw.m_sprite.graphics.clear = function () {
                    };
                } catch (e) {
                }

                world.SetDebugDraw(debugDraw);

                debugDraw.SetSprite(director.ctx);
                debugDraw.SetDrawScale(scale || CAAT.PMR);
                debugDraw.SetFillAlpha(.5);
                debugDraw.SetLineThickness(1.0);
                debugDraw.SetFlags(0x0001 | 0x0002);

            } else {
                world.SetDebugDraw(null);
            }
        };

        return {
            /**
             * Body restitution.
             */
            restitution:.5,

            /**
             * Body friction.
             */
            friction:.5,

            /**
             * Body dentisy
             */
            density:1,

            /**
             * Dynamic bodies by default
             */
            bodyType:Box2D.Dynamics.b2Body.b2_dynamicBody,

            /**
             * Box2D body
             */
            worldBody:null,

            world:null,

            /**
             * Box2d fixture
             */
            worldBodyFixture:null,
            bodyDef:null,
            fixtureDef:null,

            /**
             * BodyData object linked to the box2D body.
             */
            bodyData:null,

            recycle:false,

            /**
             * set this actor to recycle its body, that is, do not destroy it.
             */
            setRecycle:function () {
                this.recycle = true;
                return this;
            },
            destroy:function () {

                CAAT.Foundation.Box2D.B2DBodyActor.superclass.destroy.call(this);
                if (this.recycle) {
                    this.setLocation(-Number.MAX_VALUE, -Number.MAX_VALUE);
                    this.setAwake(false);
                } else {
                    var body = this.worldBody;
                    body.DestroyFixture(this.worldBodyFixture);
                    this.world.DestroyBody(body);
                }

                return this;
            },
            setAwake:function (bool) {
                this.worldBody.SetAwake(bool);
                return this;
            },
            setSleepingAllowed:function (bool) {
                this.worldBody.SetSleepingAllowed(bool);
                return this;
            },
            setLocation:function (x, y) {
                this.worldBody.SetPosition(
                    new Box2D.Common.Math.b2Vec2(
                        (x + this.width / 2) / CAAT.PMR,
                        (y + this.height / 2) / CAAT.PMR));
                return this;
            },
            /**
             * Set this body's
             * density.
             * @param d {number}
             */
            setDensity:function (d) {
                this.density = d;
                return this;
            },

            /**
             * Set this body's friction.
             * @param f {number}
             */
            setFriction:function (f) {
                this.friction = f;
                return this;
            },

            /**
             * Set this body's restitution coeficient.
             * @param r {number}
             */
            setRestitution:function (r) {
                this.restitution = r;
                return this;
            },

            /**
             * Set this body's type:
             * @param bodyType {Box2D.Dynamics.b2Body.b2_*}
             */
            setBodyType:function (bodyType) {
                this.bodyType = bodyType;
                return this;
            },

            /**
             * Helper method to check whether this js object contains a given property and if it doesn't exist
             * create and set it to def value.
             * @param obj {object}
             * @param prop {string}
             * @param def {object}
             */
            check:function (obj, prop, def) {
                if (!obj[prop]) {
                    obj[prop] = def;
                }
            },

            /**
             * Create an actor as a box2D body binding, create it on the given world and with
             * the initialization data set in bodyData object.
             * @param world {Box2D.Dynamics.b2World} a Box2D world instance
             * @param bodyData {object} An object with body info.
             */
            createBody:function (world, bodyData) {

                if (bodyData) {
                    this.check(bodyData, 'density', 1);
                    this.check(bodyData, 'friction', .5);
                    this.check(bodyData, 'restitution', .2);
                    this.check(bodyData, 'bodyType', Box2D.Dynamics.b2Body.b2_staticBody);
                    this.check(bodyData, 'userData', {});
                    this.check(bodyData, 'image', null);

                    this.density = bodyData.density;
                    this.friction = bodyData.friction;
                    this.restitution = bodyData.restitution;
                    this.bodyType = bodyData.bodyType;
                    this.image = bodyData.image;

                }

                this.world = world;

                return this;
            },

            /**
             * Get this body's center on screen regardless of its shape.
             * This method will return box2d body's centroid.
             */
            getCenter:function () {
                return this.worldBody.GetPosition();
            },

            /**
             * Get a distance joint's position on pixels.
             */
            getDistanceJointLocalAnchor:function () {
                return new Box2D.Common.Math.b2Vec2(0,0);
            },

            /**
             * Method override to get position and rotation angle from box2d body.
             * @param director {CAAT.Director}
             * @param time {number}
             */
            animate: function(director, time) {

                var pos= this.worldBody.GetPosition();

                if (this.bodyData.polygonType === CAAT.Foundation.Box2D.B2DPolygonBody.TYPE.EDGE) {
                    CAAT.Foundation.Actor.prototype.setLocation.call(
                            this,
                            CAAT.PMR*pos.x,
                            CAAT.PMR*pos.y );

                } else {
                    CAAT.Foundation.Actor.prototype.setLocation.call(
                            this,
                            CAAT.PMR*pos.x - this.width/2,
                            CAAT.PMR*pos.y - this.height/2 );
                }

                this.setRotation( this.worldBody.GetAngle() );

                return CAAT.Foundation.Box2D.B2DBodyActor.superclass.animate.call(this,director,time);
            }
        }
    }
});
