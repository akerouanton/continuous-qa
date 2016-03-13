require 'mongo'
require 'sinatra'
require 'sinatra/namespace'
require 'json'
require 'mimemagic'

$mongoClient = Mongo::Client.new([ ENV['MONGO_HOST_PORT'] || 'localhost:27017' ], :database => 'artifact')

class ArtifactApi < Sinatra::Base
  register Sinatra::Namespace

  namespace '/artifacts' do
    before { request.script_name = '/artifacts' }

    get '/:urn' do
      results = {}

      $mongoClient[:artifacts].find({ :urn => params['urn'] }).each do |doc|
        results[doc[:_id]] = url("/#{doc[:urn]}/#{doc[:filename]}")
      end

      JSON.dump results
    end

    get '/:urn/:filename' do
      doc = $mongoClient[:artifacts].find({ :urn => params['urn'], :filename => params['filename'] }).to_a

      unless doc.any?
        not_found
      else
        headers "Content-type" => doc[0][:contentType]
        body doc[0][:file]
      end
    end

    put '/:urn/:filename' do
      contentType = MimeMagic.by_magic(request.body).type

      doc = $mongoClient[:artifacts].find_one_and_replace(
        { :urn => params['urn'], :filename => params['filename'] },
        { '$set' => { :file => request.body.string, :contentType => contentType } })

      unless doc != nil
        $mongoClient[:artifacts].insert_one({
          :urn => params['urn'],
          :filename => params['filename'],
          :file => request.body.string,
          :contentType => contentType
        })
      end

      200
    end
  end

  not_found do
    'There is nothing here!'
  end
end
