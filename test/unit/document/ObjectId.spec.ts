import "mocha";
import { expect } from "chai";

import { TestHelper } from "../../helper/index";
import { ObjectId } from "../../../src/document/index";

TestHelper.initLogger();

describe("ObjectId", function() {
    describe("#Constructor", function() {
        it("should have the dependencies ready", function() {
            TestHelper.assertDependencies([ObjectId]);
        });
        
        it("should be able to create a new ObjectId()", function() {
            var id = new ObjectId();
            
            expect(id).to.exist;
            
            expect(id.toString()).to.be.equal(id.toJSON());
            
            expect(id.getTimestamp().getTime() / 1000).to.be.equal(id.generationTime);
        });
        
        it("should be able to create a new ObjectId(Number)", function() {
            var now = Date.now();
            
            var id = new ObjectId(now);
            
            expect(id).to.exist;
            
            expect(id.toString()).to.be.equal(id.toJSON());
            
            expect(id.getTimestamp().getTime() / 1000).to.be.equal(id.generationTime);
        });
        
        it("should be able to create a new ObjectId(Hex String)", function() {
            var hex = "5044555b65bedb5e56000002";
            
            var id = new ObjectId(hex);
            
            expect(id).to.exist;
            
            expect(id.toString()).to.be.equal(id.toJSON());
            
            expect(id.equals(hex)).to.be.truly;
            
            expect(id.getTimestamp().getTime() / 1000).to.be.equal(id.generationTime);
        });
        /*
        it("should be able to create a new ObjectId from a cached hexstring", function() {
            var hex = "5044555b65bedb5e56000002";
            
            ObjectId.cacheHexString = hex;
            
            var id = new ObjectId();
            
            expect(id).to.exist;
            
            expect(id.toString()).to.be.equal(id.toJSON());
            
            expect(id.equals(hex)).to.be.truly;
            
            expect(id.getTimestamp().getTime() / 1000).to.be.equal(id.generationTime);
        });
        */
        it("should be able to create a new ObjectId from a date time", function() {
            var now = Date.now();
            
            var id = ObjectId.createFromTime(now);
            
            expect(id).to.exist;
            
            expect(id.toString()).to.be.equal(id.toJSON());
            
            expect(id.getTimestamp().getTime() / 1000).to.be.equal(id.generationTime);
        });
    });
    
    describe("Methods", function() {
        it("should be able to set the generationTime", function() {
            var id = new ObjectId();
            
            expect(id).to.exist;
            
            expect(id.toString()).to.be.equal(id.toJSON());
            
            expect(id.getTimestamp().getTime() / 1000).to.be.equal(id.generationTime);
            
            var date = new Date("2016-05-27");
            
            id.generationTime = date.getTime();
            
            expect(id.getTimestamp().getTime() / 1000).to.be.equal(id.generationTime);
        });
        
        it("should create a new primary key (alias for a new instance)", function() {
            var id = ObjectId.createPk();
            
            expect(id).to.exist;
            
            expect(id.toString()).to.be.equal(id.toJSON());
            
            expect(id.getTimestamp().getTime() / 1000).to.be.equal(id.generationTime);
        });
    });
});